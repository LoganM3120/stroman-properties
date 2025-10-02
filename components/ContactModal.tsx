'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    subject: '',
    body: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [view, setView] = useState<'options' | 'email'>('options');

  useEffect(() => {
    if (open) {
      setView('options');
      setStatus('idle');
      setErrorMessage('');
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setErrorMessage(data?.message ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm({ email: '', firstName: '', lastName: '', subject: '', body: '' });
    } catch (error) {
      console.error('Failed to send contact request', error);
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <Image
          src="/images/logo_transparent.png"
          alt="Stroman Properties logo"
          width={160}
          height={40}
          className="modal-logo"
        />
        {view === 'options' ? (
          <>
            <button
              className="btn"
              onClick={() => {
                setStatus('idle');
                setErrorMessage('');
                setView('email');
              }}
            >
              Email
            </button>
            <p className="or-text">--OR--</p>
            <a
              href="tel:5719198268"
              className="btn call-btn"
              onClick={onClose}
            >
              Call
            </a>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div className="name-fields">
              <input
                type="text"
                placeholder="First Name"
                required
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <textarea
              placeholder="Body"
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending…' : 'Send Email'}
            </button>
            {status === 'success' && (
              <p className="success-text">Thanks! Your message has been sent.</p>
            )}
            {status === 'error' && (
              <p className="error-text" role="alert">
                {errorMessage}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

