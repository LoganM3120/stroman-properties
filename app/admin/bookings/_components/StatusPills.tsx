interface StatusPillProps {
  status: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending_hold: 'Pending',
  paid: 'Confirmed',
  expired: 'Expired',
  canceled: 'Canceled',
  cancelled: 'Canceled',
};

export default function StatusPill({ status }: StatusPillProps) {
  if (!status) {
    return <span className="status-pill status-pill--muted">Unknown</span>;
  }
  const normalized = status.toLowerCase();
  const label = STATUS_LABELS[normalized] ?? status;

  const classes = ['status-pill'];
  if (normalized === 'pending_hold') {
    classes.push('status-pill--pending');
  } else if (normalized === 'paid') {
    classes.push('status-pill--confirmed');
  } else if (normalized === 'expired') {
    classes.push('status-pill--expired');
  } else if (normalized === 'canceled' || normalized === 'cancelled') {
    classes.push('status-pill--canceled');
  } else {
    classes.push('status-pill--muted');
  }

  return <span className={classes.join(' ')}>{label}</span>;
}
