import Link from "next/link";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const success = status === "success";
  return <section className="auth-shell"><div className="auth-card center"><div className={`status-icon ${success ? "ok" : "bad"}`}>{success ? "✓" : "!"}</div><h1>{success ? "Sikeres megerősítés" : "Érvénytelen hivatkozás"}</h1><p>{success ? "Az e-mail-címét megerősítettük. Most már bejelentkezhet." : "A megerősítő hivatkozás hibás, már felhasználták vagy lejárt."}</p><Link className="button" href={success ? "/login" : "/register"}>{success ? "Bejelentkezés" : "Új regisztráció"}</Link></div></section>;
}
