import Link from 'next/link';
import type { ToolbarMeta } from '@/lib/admin/bookings';
import { fetchToolbarMeta, listBookingsByStatus } from '@/lib/admin/bookings';
import { requireOwnerSession } from '@/lib/admin/auth';
import BookingsTable from './_components/BookingsTable';
import Toolbar from './_components/Toolbar';

const TAB_OPTIONS = [
  { label: 'Pending', value: 'pending' as const },
  { label: 'Confirmed', value: 'confirmed' as const },
  { label: 'Expired', value: 'expired' as const },
];

type TabValue = (typeof TAB_OPTIONS)[number]['value'];

function isValidTab(value: string | undefined): value is TabValue {
  return TAB_OPTIONS.some((tab) => tab.value === value);
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams?: { [key: string]: string | undefined };
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  await requireOwnerSession();

  const statusParam = searchParams?.status;
  const activeTab: TabValue = isValidTab(statusParam) ? statusParam : 'pending';

  const [bookingsResult, toolbarResult] = await Promise.allSettled([
    listBookingsByStatus(activeTab),
    fetchToolbarMeta(),
  ]);

  const bookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value : [];
  const toolbarMeta: ToolbarMeta =
    toolbarResult.status === 'fulfilled'
      ? toolbarResult.value
      : { lastSweepAt: null, nextSweepEta: null };

  const loadError =
    bookingsResult.status === 'rejected'
      ? bookingsResult.reason instanceof Error
        ? bookingsResult.reason.message
        : 'Unable to load bookings.'
      : null;

  return (
    <div className="admin-bookings">
      <header className="admin-header">
        <h1>Booking Dashboard</h1>
        <p className="admin-header__subtitle">
          Review pending holds, confirm payments, and monitor automated expiration sweeps.
        </p>
      </header>

      <Toolbar meta={toolbarMeta} />

      <nav className="admin-tabs" aria-label="Booking status tabs">
        {TAB_OPTIONS.map((tab) => {
          const href = tab.value === 'pending' ? '/admin/bookings' : `/admin/bookings?status=${tab.value}`;
          const isActive = tab.value === activeTab;
          return (
            <Link key={tab.value} href={href} className={isActive ? 'admin-tab admin-tab--active' : 'admin-tab'}>
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {loadError ? <p className="admin-error">{loadError}</p> : null}
      <BookingsTable bookings={bookings} status={activeTab} />
    </div>
  );
}
