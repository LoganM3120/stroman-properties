import { PROPERTY_TIMEZONE } from '@/lib/stays';
import type { AdminBooking, AdminBookingStatus } from '@/lib/admin/bookings';
import BookingDetailDrawer from './BookingDetailDrawer';
import Countdown from './Countdown';
import StatusPill from './StatusPills';
import {
  cancelBookingAction,
  confirmBookingAction,
  expireBookingAction,
} from '../_actions';

interface BookingsTableProps {
  bookings: AdminBooking[];
  status: AdminBookingStatus;
}

function isHoldExpired(booking: AdminBooking): boolean {
  if (!booking.holdExpiresAt) {
    return false;
  }
  const date = new Date(booking.holdExpiresAt);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return date.getTime() <= Date.now();
}

function formatDateRange(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) {
    return '—';
  }
  const arrival = new Date(checkIn);
  const departure = new Date(checkOut);
  if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime())) {
    return '—';
  }
  return `${arrival.toLocaleDateString()} → ${departure.toLocaleDateString()}`;
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString();
}

export default function BookingsTable({ bookings, status }: BookingsTableProps) {
  if (!bookings.length) {
    return <p className="admin-empty">No bookings found.</p>;
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Guest</th>
            <th>Stay</th>
            <th>Status</th>
            <th>Expires In</th>
            <th>Payment</th>
            <th>Proof</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const holdExpired = isHoldExpired(booking);
            const disableConfirm = status !== 'pending' || holdExpired;
            const disableExpire = status !== 'pending' || holdExpired;
            const disableCancel = status === 'expired';
            return (
              <tr key={booking.id} className={holdExpired ? 'admin-row--expired' : undefined}>
                <td>
                  <div className="admin-table__invoice">
                    <strong>{booking.invoiceNumber}</strong>
                    <BookingDetailDrawer booking={booking} />
                  </div>
                </td>
                <td>
                  <div>{booking.guest?.fullName ?? '—'}</div>
                  <div className="admin-table__muted">{booking.guest?.email ?? '—'}</div>
                  <div className="admin-table__muted">{booking.guest?.phone ?? '—'}</div>
                </td>
                <td>
                  <div>{formatDateRange(booking.checkIn, booking.checkOut)}</div>
                  <div className="admin-table__muted">
                    {booking.nights ? `${booking.nights} night${booking.nights === 1 ? '' : 's'}` : '—'}
                  </div>
                </td>
                <td>
                  <StatusPill status={booking.status} />
                </td>
                <td>
                  {status === 'pending' ? (
                    <Countdown target={booking.holdExpiresAt} timezone={PROPERTY_TIMEZONE} />
                  ) : (
                    <span>{formatTimestamp(booking.holdExpiresAt)}</span>
                  )}
                </td>
                <td>
                  <div>{booking.paymentMethod ?? '—'}</div>
                  <div className="admin-table__muted">{booking.payment?.status ?? '—'}</div>
                </td>
                <td>
                  {booking.payment?.proofFileUrl ? (
                    <a href={booking.payment.proofFileUrl} target="_blank" rel="noreferrer noopener">
                      View proof
                    </a>
                  ) : (
                    <span className="admin-table__muted">No file</span>
                  )}
                </td>
                <td>{formatTimestamp(booking.createdAt)}</td>
                <td>
                  <div className="admin-actions">
                    <form action={confirmBookingAction}>
                      <input type="hidden" name="invoice_number" value={booking.invoiceNumber} />
                      <button type="submit" disabled={disableConfirm}>
                        Confirm
                      </button>
                    </form>
                    <form action={expireBookingAction}>
                      <input type="hidden" name="invoice_number" value={booking.invoiceNumber} />
                      <button type="submit" disabled={disableExpire}>
                        Expire
                      </button>
                    </form>
                    <form action={cancelBookingAction}>
                      <input type="hidden" name="invoice_number" value={booking.invoiceNumber} />
                      <button type="submit" disabled={disableCancel}>
                        Cancel
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
