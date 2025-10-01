'use client';

import { useFormState, useFormStatus } from 'react-dom';

interface LoginState {
  error?: string;
}

const INITIAL_STATE: LoginState = {};

interface Props {
  action: (state: LoginState, formData: FormData) => Promise<LoginState | void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

export default function LoginForm({ action }: Props) {
  const [state, formAction] = useFormState(action, INITIAL_STATE);

  return (
    <form className="admin-login__form" action={formAction}>
      <label htmlFor="code">Admin Access Code</label>
      <input id="code" name="code" type="password" placeholder="Enter code" required />
      {state?.error ? <p className="admin-login__error">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
