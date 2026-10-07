"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export function RegisterForm() {
  const [state, setState] = useState<{ loading: boolean; error?: string; success?: string }>({ loading: false });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true });
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const result = await response.json();
    setState(response.ok ? { loading: false, success: result.message } : { loading: false, error: result.error });
    if (response.ok) event.currentTarget.reset();
  }
  return (
    <form className="auth-form" onSubmit={submit}>
      <label>Teljes név<input name="name" autoComplete="name" minLength={2} maxLength={120} required /></label>
      <label>E-mail-cím<input name="email" type="email" autoComplete="email" required /></label>
      <div className="form-row">
        <label>Jelszó<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label>
        <label>Jelszó újra<input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={10} required /></label>
      </div>
      <p className="form-hint">Legalább 10 karakter, betűvel és számmal.</p>
      {state.error && <p className="alert error" role="alert">{state.error}</p>}
      {state.success && <p className="alert success" role="status">{state.success} Ellenőrizze a postafiókját.</p>}
      <button className="button full" disabled={state.loading}>{state.loading ? "Regisztráció…" : "Fiók létrehozása"}</button>
      <p className="form-foot">Már van fiókja? <Link href="/login">Jelentkezzen be</Link></p>
    </form>
  );
}
