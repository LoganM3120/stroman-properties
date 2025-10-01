import type { AdminBooking } from '@/lib/admin/bookings';

interface BookingDetailDrawerProps {
  booking: AdminBooking;
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString();
}

export default function BookingDetailDrawer({ booking }: BookingDetailDrawerProps) {
  return (
    <details className="booking-detail">
      <summary>View details</summary>
      <div className="booking-detail__grid">
        <div>
          <h4>Guest</h4>
          <p>{booking.guest?.fullName ?? '—'}</p>
          <p>{booking.guest?.email ?? '—'}</p>
          <p>{booking.guest?.phone ?? '—'}</p>
        </div>
        <div>
          <h4>Payment</h4>
          <p>Method: {booking.paymentMethod ?? '—'}</p>
          <p>Status: {booking.payment?.status ?? '—'}</p>
          <p>
            Amount:{' '}
            {typeof booking.payment?.amount === 'number'
              ? `$${booking.payment.amount.toFixed(2)}`
              : '—'}
          </p>
          <p>
            Proof:{' '}
            {booking.payment?.proofFileUrl ? (
              <a href={booking.payment.proofFileUrl} target="_blank" rel="noreferrer noopener">
                View file
              </a>
            ) : (
              '—'
            )}
          </p>
        </div>
        <div>
          <h4>Timestamps</h4>
          <p>Hold expires: {formatDate(booking.holdExpiresAt)}</p>
          <p>Created: {formatDate(booking.createdAt)}</p>
          <p>Paid: {formatDate(booking.paidAt)}</p>
          <p>Expired: {formatDate(booking.expiredAt)}</p>
          <p>Cancelled: {formatDate(booking.canceledAt)}</p>
        </div>
      </div>
    </details>
  );
}
