import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return <section className="auth-shell"><div className="auth-card"><span className="eyebrow">Üdvözöljük újra</span><h1>Bejelentkezés</h1><p>A saját feladataihoz csak Ön férhet hozzá.</p><LoginForm /></div></section>;
}
