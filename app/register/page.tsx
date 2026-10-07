import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return <section className="auth-shell"><div className="auth-card"><span className="eyebrow">Biztonságos regisztráció</span><h1>Hozza létre fiókját</h1><p>A belépéshez meg kell erősítenie az e-mail-címét.</p><RegisterForm /></div></section>;
}
