import Link from "next/link";

const features = [
  ["Saját szerver", "Az alkalmazás Ubuntu Linuxon, Docker-konténerekben fut."],
  ["Tartós adatok", "A felhasználók és feladatok saját PostgreSQL-adatbázisban maradnak."],
  ["Biztonságos belépés", "Argon2id jelszóvédelem, e-mail-megerősítés és védett munkamenetek."],
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">GanzPortalok infrastruktúra-teszt</span>
          <h1>A feladatai.<br /><span>A saját rendszerében.</span></h1>
          <p>Teljes értékű regisztrációs és Todo-alkalmazás külső alkalmazáshoszting és menedzselt adatbázis nélkül.</p>
          <div className="hero-actions">
            <Link className="button" href="/register">Fiók létrehozása</Link>
            <Link className="button button-secondary" href="/login">Már van fiókom</Link>
          </div>
          <div className="trust-row"><span>HTTPS</span><span>PostgreSQL</span><span>Docker</span><span>Nyílt forráskód</span></div>
        </div>
        <div className="hero-panel" aria-hidden="true">
          <div className="mini-window">
            <div className="mini-head"><i></i><i></i><i></i><span>Mai feladatok</span></div>
            <div className="mini-card done"><b>✓</b><span>Projektterv áttekintése<small>Teljesítve</small></span></div>
            <div className="mini-card"><b>2</b><span>Adatbázis mentése<small>Magas prioritás</small></span></div>
            <div className="mini-card"><b>3</b><span>Heti feladatlista<small>Holnap</small></span></div>
          </div>
        </div>
      </section>
      <section className="feature-grid">
        {features.map(([title, text]) => <article key={title}><span className="feature-dot"></span><h2>{title}</h2><p>{text}</p></article>)}
      </section>
    </>
  );
}
