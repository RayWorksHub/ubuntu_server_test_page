import nodemailer from "nodemailer";
import { getEnv } from "@/lib/env";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[char] as string);
}

function shell(title: string, intro: string, body: string) {
  return `<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:620px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 35px rgba(18,33,61,.09)"><tr><td style="padding:28px 34px;background:linear-gradient(135deg,#b31322,#e23a4c);color:#fff"><div style="font-size:13px;letter-spacing:.16em;text-transform:uppercase">GanzPortalok</div><h1 style="font-size:25px;margin:8px 0 0">${escapeHtml(title)}</h1></td></tr><tr><td style="padding:34px"><p style="font-size:17px;line-height:1.6;margin-top:0">${escapeHtml(intro)}</p>${body}<p style="margin:30px 0 0;color:#6b7280;font-size:13px;line-height:1.5">Ha nem Ön kezdeményezte ezt a műveletet, hagyja figyelmen kívül ezt az üzenetet.</p></td></tr></table></td></tr></table></body></html>`;
}

function button(label: string, url: string) {
  return `<p style="margin:26px 0"><a href="${escapeHtml(url)}" style="display:inline-block;padding:13px 22px;border-radius:10px;background:#b31322;color:white;text-decoration:none;font-weight:700">${escapeHtml(label)}</a></p><p style="font-size:12px;color:#6b7280;word-break:break-all">${escapeHtml(url)}</p>`;
}

async function send(subject: string, to: string, html: string, text: string) {
  const env = getEnv();
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE === "true",
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  return transport.sendMail({ from: `GanzPortalok <${env.SMTP_FROM}>`, to, subject, html, text });
}

export function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${getEnv().APP_URL}/api/auth/verify?token=${encodeURIComponent(token)}`;
  return send(
    "Erősítse meg az e-mail-címét",
    to,
    shell("E-mail-cím megerősítése", `Kedves ${name}!`, `<p>A regisztráció befejezéséhez erősítse meg az e-mail-címét. A hivatkozás 24 óráig használható.</p>${button("E-mail-cím megerősítése", url)}`),
    `Kedves ${name}! Erősítse meg az e-mail-címét 24 órán belül: ${url}`,
  );
}

export function sendVerifiedEmail(to: string, name: string) {
  return send(
    "Sikeres e-mail-megerősítés",
    to,
    shell("Sikeres megerősítés", `Kedves ${name}!`, "<p>Az e-mail-címét sikeresen megerősítettük. Most már bejelentkezhet a GanzPortalok tesztalkalmazásba.</p>"),
    `Kedves ${name}! Az e-mail-címét sikeresen megerősítettük.`,
  );
}

export function sendLoginEmail(to: string, name: string, date: string, agent: string) {
  return send(
    "Új bejelentkezés a GanzPortalok rendszerbe",
    to,
    shell("Új bejelentkezés", `Kedves ${name}!`, `<p>Új bejelentkezést észleltünk.</p><table role="presentation" style="width:100%;background:#f7f8fb;border-radius:10px;padding:14px"><tr><td><strong>Időpont</strong></td><td>${escapeHtml(date)}</td></tr><tr><td><strong>Eszköz</strong></td><td>${escapeHtml(agent)}</td></tr></table>`),
    `Új bejelentkezés. Időpont: ${date}. Eszköz: ${agent}`,
  );
}

export function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${getEnv().APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
  return send(
    "Jelszó-visszaállítás",
    to,
    shell("Jelszó-visszaállítás", `Kedves ${name}!`, `<p>A jelszó módosításához használja az alábbi egyszer használatos hivatkozást. A hivatkozás 30 percig érvényes.</p>${button("Új jelszó beállítása", url)}`),
    `Jelszó-visszaállítás 30 percen belül: ${url}`,
  );
}

export function sendPasswordChangedEmail(to: string, name: string) {
  return send(
    "A jelszava megváltozott",
    to,
    shell("Sikeres jelszómódosítás", `Kedves ${name}!`, "<p>A GanzPortalok-fiók jelszavát sikeresen megváltoztattuk, és minden korábbi munkamenetet lezártunk.</p>"),
    `Kedves ${name}! A jelszava sikeresen megváltozott.`,
  );
}
