import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GanzPortalok – Saját infrastruktúra teszt",
  description: "Biztonságos, saját szerveren futó feladatkezelő tesztalkalmazás.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            <span className="brand-mark">G</span>
            <span><strong>GanzPortalok</strong><small>Saját infrastruktúra</small></span>
          </Link>
          <nav aria-label="Fő navigáció">
            <Link href="/login">Bejelentkezés</Link>
            <Link className="button button-small" href="/register">Regisztráció</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">© {new Date().getFullYear()} GanzPortalok · Saját Ubuntu, Docker és PostgreSQL infrastruktúrán</footer>
      </body>
    </html>
  );
}
