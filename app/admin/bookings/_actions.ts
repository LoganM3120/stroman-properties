'use server';

import { revalidatePath } from 'next/cache';
import { postAdminApi } from '@/lib/admin/http';

async function performAction(path: string, invoiceNumber: string) {
  await postAdminApi(path, { body: { invoice_number: invoiceNumber } });
  revalidatePath('/admin/bookings');
}

export async function confirmBookingAction(formData: FormData) {
  const invoiceNumber = formData.get('invoice_number');
  if (typeof invoiceNumber !== 'string' || !invoiceNumber.trim()) {
    throw new Error('Missing invoice number');
  }
  await performAction('/api/admin/bookings/verify', invoiceNumber.trim());
}

export async function expireBookingAction(formData: FormData) {
  const invoiceNumber = formData.get('invoice_number');
  if (typeof invoiceNumber !== 'string' || !invoiceNumber.trim()) {
    throw new Error('Missing invoice number');
  }
  await performAction('/api/admin/bookings/expire', invoiceNumber.trim());
}

export async function cancelBookingAction(formData: FormData) {
  const invoiceNumber = formData.get('invoice_number');
  if (typeof invoiceNumber !== 'string' || !invoiceNumber.trim()) {
    throw new Error('Missing invoice number');
  }
  await performAction('/api/admin/bookings/cancel', invoiceNumber.trim());
}
