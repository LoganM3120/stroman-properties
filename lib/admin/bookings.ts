import { createStayDetails } from '@/lib/stays';
import { supabaseJson } from '@/lib/supabase/rest';

export type AdminBookingStatus = 'pending' | 'confirmed' | 'expired';

const STATUS_TO_DB: Record<AdminBookingStatus, string> = {
  pending: 'pending_hold',
  confirmed: 'paid',
  expired: 'expired',
};

interface BookingRecord {
  id: string;
  invoice_number: string;
  status: string;
  hold_expires_at: string | null;
  check_in: string | null;
  check_out: string | null;
  guest_id: string | null;
  payment_method: string | null;
  created_at: string | null;
  paid_at: string | null;
  expired_at: string | null;
  canceled_at: string | null;
  updated_at?: string | null;
}

interface GuestRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface PaymentRecord {
  id: string;
  booking_id: string;
  status: string | null;
  processor: string | null;
  payer_name: string | null;
  reference: string | null;
  note: string | null;
  proof_file_url: string | null;
  received_at: string | null;
  verified_at: string | null;
  amount: number | null;
  created_at: string | null;
}

export interface AdminBookingGuest {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
}

export interface AdminBookingPayment {
  id: string;
  status: string | null;
  processor: string | null;
  payerName: string | null;
  reference: string | null;
  note: string | null;
  proofFileUrl: string | null;
  receivedAt: string | null;
  verifiedAt: string | null;
  amount: number | null;
  createdAt: string | null;
}

export interface AdminBooking {
  id: string;
  invoiceNumber: string;
  status: string;
  holdExpiresAt: string | null;
  checkIn: string | null;
  checkOut: string | null;
  paymentMethod: string | null;
  createdAt: string | null;
  paidAt: string | null;
  expiredAt: string | null;
  canceledAt: string | null;
  nights: number | null;
  guest: AdminBookingGuest | null;
  payment: AdminBookingPayment | null;
}

export interface ToolbarMeta {
  lastSweepAt: string | null;
  nextSweepEta: string | null;
}

function encodeList(values: string[]): string {
  return values.map((value) => encodeURIComponent(value)).join(',');
}

async function fetchBookings(status: AdminBookingStatus): Promise<BookingRecord[]> {
  const dbStatus = STATUS_TO_DB[status];
  const params = new URLSearchParams();
  params.set('status', `eq.${dbStatus}`);
  params.set(
    'select',
    [
      'id',
      'invoice_number',
      'status',
      'hold_expires_at',
      'check_in',
      'check_out',
      'guest_id',
      'payment_method',
      'created_at',
      'paid_at',
      'expired_at',
      'canceled_at',
    ].join(','),
  );
  params.set('order', 'created_at.desc');
  const path = `/bookings?${params.toString()}`;
  const records = await supabaseJson<BookingRecord[]>(path);
  return records ?? [];
}

async function fetchGuests(guestIds: string[]): Promise<Map<string, AdminBookingGuest>> {
  if (!guestIds.length) {
    return new Map();
  }
  const params = new URLSearchParams();
  params.set('id', `in.(${encodeList(guestIds)})`);
  params.set('select', 'id,full_name,email,phone');
  const records = (await supabaseJson<GuestRecord[]>(`/guests?${params.toString()}`)) ?? [];
  return new Map(
    records.map((guest) => [
      guest.id,
      {
        id: guest.id,
        fullName: guest.full_name,
        email: guest.email,
        phone: guest.phone,
      },
    ]),
  );
}

async function fetchPayments(bookingIds: string[]): Promise<Map<string, AdminBookingPayment>> {
  if (!bookingIds.length) {
    return new Map();
  }
  const params = new URLSearchParams();
  params.set('booking_id', `in.(${encodeList(bookingIds)})`);
  params.set(
    'select',
    [
      'id',
      'booking_id',
      'status',
      'processor',
      'payer_name',
      'reference',
      'note',
      'proof_file_url',
      'received_at',
      'verified_at',
      'amount',
      'created_at',
    ].join(','),
  );
  params.set('order', 'created_at.desc');
  const records = (await supabaseJson<PaymentRecord[]>(`/payments?${params.toString()}`)) ?? [];
  const map = new Map<string, AdminBookingPayment>();
  for (const record of records) {
    if (map.has(record.booking_id)) {
      continue;
    }
    map.set(record.booking_id, {
      id: record.id,
      status: record.status,
      processor: record.processor,
      payerName: record.payer_name,
      reference: record.reference,
      note: record.note,
      proofFileUrl: record.proof_file_url,
      receivedAt: record.received_at,
      verifiedAt: record.verified_at,
      amount: record.amount,
      createdAt: record.created_at,
    });
  }
  return map;
}

export async function listBookingsByStatus(status: AdminBookingStatus): Promise<AdminBooking[]> {
  const bookings = await fetchBookings(status);
  if (!bookings.length) {
    return [];
  }
  const guestIds = Array.from(new Set(bookings.map((booking) => booking.guest_id).filter(Boolean))) as string[];
  const bookingIds = bookings.map((booking) => booking.id);

  const [guestMap, paymentMap] = await Promise.all([
    fetchGuests(guestIds),
    fetchPayments(bookingIds),
  ]);

  return bookings.map<AdminBooking>((booking) => {
    const stayDetails =
      booking.check_in && booking.check_out
        ? createStayDetails(booking.check_in, booking.check_out)
        : null;
    return {
      id: booking.id,
      invoiceNumber: booking.invoice_number,
      status: booking.status,
      holdExpiresAt: booking.hold_expires_at,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      paymentMethod: booking.payment_method,
      createdAt: booking.created_at,
      paidAt: booking.paid_at,
      expiredAt: booking.expired_at,
      canceledAt: booking.canceled_at,
      nights: stayDetails?.nights ?? null,
      guest: booking.guest_id ? guestMap.get(booking.guest_id) ?? null : null,
      payment: paymentMap.get(booking.id) ?? null,
    };
  });
}

interface AuditRecord {
  created_at: string | null;
  actor: string | null;
}

const CRON_INTERVAL_MINUTES = 20;

function computeNextSweep(lastSweepAt: string | null): string | null {
  if (!lastSweepAt) {
    return null;
  }
  const date = new Date(lastSweepAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setMinutes(date.getMinutes() + CRON_INTERVAL_MINUTES);
  return date.toISOString();
}

export async function fetchToolbarMeta(): Promise<ToolbarMeta> {
  try {
    const params = new URLSearchParams();
    params.set('actor', 'eq.cron/expire-holds');
    params.set('select', 'created_at,actor');
    params.set('order', 'created_at.desc');
    params.set('limit', '1');
    const events = await supabaseJson<AuditRecord[]>(`/booking_audit_events?${params.toString()}`);
    const lastSweepAt = events?.[0]?.created_at ?? null;
    return {
      lastSweepAt,
      nextSweepEta: computeNextSweep(lastSweepAt),
    };
  } catch (error) {
    console.error('Failed to load toolbar metadata', error);
    return {
      lastSweepAt: null,
      nextSweepEta: null,
    };
  }
}
