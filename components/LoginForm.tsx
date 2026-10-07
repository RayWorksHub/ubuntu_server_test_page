"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState<{ loading: boolean; error?: string }>({ loading: false });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true });
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });
    const result = await response.json();
    if (!response.ok) return setState({ loading: false, error: result.error });
    router.push("/dashboard");
    router.refresh();
  }
  return (
    <form className="auth-form" onSubmit={submit}>
      <label>E-mail-cím<input name="email" type="email" autoComplete="email" required /></label>
      <label>Jelszó<input name="password" type="password" autoComplete="current-password" required /></label>
      <div className="form-options"><Link href="/auth/forgot-password">Elfelejtett jelszó</Link></div>
      {state.error && <p className="alert error" role="alert">{state.error}</p>}
      <button className="button full" disabled={state.loading}>{state.loading ? "Bejelentkezés…" : "Bejelentkezés"}</button>
      <p className="form-foot">Nincs még fiókja? <Link href="/register">Regisztráljon</Link></p>
    </form>
  );
}
