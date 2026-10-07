"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, setState] = useState<{ loading: boolean; error?: string; success?: string }>({ loading: false });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState({ loading: true });
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...values, token }) });
    const result = await response.json();
    setState(response.ok ? { loading: false, success: result.message } : { loading: false, error: result.error });
  }
  return <form className="auth-form" onSubmit={submit}><label>Új jelszó<input name="password" type="password" minLength={10} autoComplete="new-password" required /></label><label>Új jelszó újra<input name="passwordConfirmation" type="password" minLength={10} autoComplete="new-password" required /></label>{state.error && <p className="alert error">{state.error}</p>}{state.success && <p className="alert success">{state.success} <Link href="/login">Bejelentkezés</Link></p>}<button className="button full" disabled={state.loading || !!state.success}>{state.loading ? "Mentés…" : "Új jelszó mentése"}</button></form>;
}
