"use client";

import { FormEvent, useState } from "react";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const email = String(new FormData(event.currentTarget).get("email"));
    const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    const result = await response.json();
    setMessage(result.message || result.error); setLoading(false);
  }
  return <form className="auth-form" onSubmit={submit}><label>E-mail-cím<input name="email" type="email" autoComplete="email" required /></label>{message && <p className="alert success">{message}</p>}<button className="button full" disabled={loading}>{loading ? "Küldés…" : "Visszaállítási link küldése"}</button></form>;
}
