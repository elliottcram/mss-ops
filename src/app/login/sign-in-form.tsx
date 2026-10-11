'use client'

import { useActionState } from 'react'
import { signIn, type SignInState } from './actions'

export function SignInForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {})
  return (
    <form action={action} className="form" style={{ gap: 16 }}>
      {state.error && <div className="banner error" role="alert">{state.error}</div>}
      <label className="field">
        <span>Email</span>
        <input className="input" type="email" name="email" autoComplete="username" required />
      </label>
      <label className="field">
        <span>Password</span>
        <input className="input" type="password" name="password" autoComplete="current-password" required />
      </label>
      <button className="btn" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}
