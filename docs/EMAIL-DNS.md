# E-mail- és DNS-beállítások

Az alkalmazás hitelesített SMTP-kapcsolaton küld a `administration@ganzportalok.hu` címről. A jelszó kizárólag a szerveren található `.env` fájlban szerepelhet.

## Rackhost SMTP

- Felhasználónév: a teljes postafiókcím
- Titkosított kapcsolat: SMTPS/TLS
- A pontos kiszolgálónevet és portot a Rackhost adott postafiókhoz tartozó útmutatója szerint kell ellenőrizni.

## Küldő domain hitelesítése

- **SPF:** egyetlen SPF TXT rekord maradjon a gyökérdomainen. Rackhost küldés esetén tartalmazza a Rackhost által megadott `include` értéket.
- **DKIM:** a Rackhost által létrehozott selectorok TXT rekordjait változatlanul meg kell őrizni.
- **DMARC:** induló szabály:

  - Hosztnév: `_dmarc.ganzportalok.hu`
  - Típus: `TXT`
  - Érték: `v=DMARC1; p=none; rua=mailto:administration@ganzportalok.hu; adkim=r; aspf=r; pct=100`

A kézbesítés igazolása után a DMARC-szabály fokozatosan `quarantine`, majd `reject` értékre szigorítható. Egyszerre több SPF rekord nem lehet.

## Webes DNS

- `ganzportalok.hu` `A` rekordja a nyilvánosan elérhető szerver IPv4-címére mutasson.
- `www.ganzportalok.hu` legyen ugyanarra az IPv4-címre mutató `A` rekord, vagy a gyökérdomainre mutató `CNAME`.
- Az MX, SPF és DKIM rekordokat a webes átállítás nem érinti.
