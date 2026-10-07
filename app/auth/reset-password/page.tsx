import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <section className="auth-shell"><div className="auth-card"><span className="eyebrow">Fiók helyreállítása</span><h1>Új jelszó</h1><p>Válasszon legalább 10 karakteres új jelszót.</p>{token ? <ResetPasswordForm token={token} /> : <p className="alert error">Hiányzó visszaállítási token.</p>}</div></section>;
}
