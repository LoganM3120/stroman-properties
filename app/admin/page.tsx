import { redirect } from 'next/navigation';
import { hasOwnerSession } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminIndexPage() {
  if (await hasOwnerSession()) {
    redirect('/admin/bookings');
  }

  redirect('/admin/login');
}
