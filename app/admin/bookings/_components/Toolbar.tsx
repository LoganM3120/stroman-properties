import type { ToolbarMeta } from '@/lib/admin/bookings';

interface ToolbarProps {
  meta: ToolbarMeta;
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function Toolbar({ meta }: ToolbarProps) {
  return (
    <section className="admin-toolbar" aria-label="Automation status">
      <div>
        <span className="admin-toolbar__label">Last expire sweep</span>
        <strong>{formatDate(meta.lastSweepAt)}</strong>
      </div>
      <div>
        <span className="admin-toolbar__label">Next sweep ETA</span>
        <strong>{formatDate(meta.nextSweepEta)}</strong>
      </div>
    </section>
  );
}
