import { redirect } from 'next/navigation';
import LoginForm, { INITIAL_STATE, type LoginState } from './LoginForm';
import {
  createOwnerSessionCookie,
  getOwnerDashboardSecret,
  hasOwnerSession,
} from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLoginPage() {
  if (await hasOwnerSession()) {
    redirect('/admin/bookings');
  }

  async function authenticate(
    _prevState: LoginState,
    formData: FormData,
  ): Promise<LoginState> {
    'use server';

    const code = formData.get('code');
    if (typeof code !== 'string' || !code.trim()) {
      return { error: 'Enter the access code.' };
    }

    const expected = getOwnerDashboardSecret();
    if (code.trim() !== expected) {
      return { error: 'Invalid access code.' };
    }

    await createOwnerSessionCookie();
    redirect('/admin/bookings');
    return INITIAL_STATE;
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <h1>Owner Dashboard</h1>
        <p className="admin-login__subtitle">Enter the access code to view booking holds.</p>
        <LoginForm action={authenticate} />
      </div>
    </div>
  );
}
