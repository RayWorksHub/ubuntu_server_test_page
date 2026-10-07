import Link from "next/link";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return <section className="auth-shell"><div className="auth-card"><span className="eyebrow">Fiók helyreállítása</span><h1>Elfelejtett jelszó</h1><p>Adja meg a regisztrált e-mail-címét.</p><ForgotPasswordForm /><p className="form-foot"><Link href="/login">Vissza a bejelentkezéshez</Link></p></div></section>;
}
