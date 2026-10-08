# GanzPortalok saját infrastruktúra tesztalkalmazás

Docker-alapú Next.js + TypeScript alkalmazás saját PostgreSQL-adatbázissal, Prisma migrációkkal, Caddy reverse proxyval, Cloudflare Tunnellel és hitelesített SMTP-küldéssel.

## Funkciók

- regisztráció Argon2id jelszóhash-sel;
- lejáró, egyszer használatos e-mail-megerősítés;
- szerveroldali, adatbázisban tárolt munkamenetek biztonságos cookie-val;
- bejelentkezési értesítés és próbálkozáskorlátozás;
- e-mailes jelszó-visszaállítás;
- felhasználónként elkülönített Todo-listák és feladatok;
- tartós PostgreSQL-volume;
- automatikus Prisma migráció induláskor;
- Cloudflare Tunnel-alapú nyilvános HTTPS, nyitott routerport nélkül;
- Caddy reverse proxy és biztonsági fejlécek;
- mentési és explicit megerősítést igénylő visszaállítási eljárás.

## Első telepítés

1. Másolja `.env.example` fájlt `.env` néven a szerveren.
2. Generáljon külön, erős adatbázis-jelszót és alkalmazástitkot.
3. Adja meg a hitelesített SMTP-adatokat.
4. Hozza létre a Cloudflare Tunnelt, és mentse a kapott tokent `CLOUDFLARE_TUNNEL_TOKEN` néven a szerveroldali `.env` fájlba.
5. Indítás:

```bash
docker compose config --quiet
docker compose build
docker compose up -d
docker compose ps
```

Az SMTP-jelszó biztonságosan, rejtett terminálbevitellel is beállítható:

```bash
./scripts/configure-smtp.sh
```

A PostgreSQL szolgáltatásnak nincs publikált hostportja; kizárólag a belső `database` Docker-hálózaton érhető el.

## Biztonsági mentés

```bash
./scripts/backup.sh
```

A mentések alapértelmezetten a `backups/` mappába kerülnek, nem verziókövetettek, és a script 14 napos helyi megőrzést alkalmaz.

Visszaállítás kizárólag tudatos megerősítéssel:

```bash
CONFIRM_RESTORE=YES_REPLACE_GANZPORTALOK_DATABASE ./scripts/restore.sh backups/ganzportalok-IDOPONT.sql.gz
```

## Ellenőrzés

```bash
docker build --target test -t ganzportalok-test:verification .
curl -fsS https://ganzportalok.hu/api/health
```

Az SMTP és DNS részletes leírása: `docs/EMAIL-DNS.md`.

A Cloudflare Tunnel és a névszerver-átállítás pontos sorrendje: `docs/HOST-NETWORK.md`.
