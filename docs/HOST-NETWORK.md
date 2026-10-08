# Nyilvános elérés Cloudflare Tunnellel

A szerver változó hálózaton és VirtualBox NAT mögött is futhat. A `cloudflared` konténer kifelé épít titkosított kapcsolatot a Cloudflare hálózatához, ezért nincs szükség routeres porttovábbításra, nyilvános IPv4-címre vagy bejövő 80/443 portokra.

## Felépítés

- A `cloudflared` ugyanazon a Docker `web` hálózaton éri el a Caddyt a `caddy:8080` címen.
- A Caddy továbbítja a kéréseket az `app:3000` szolgáltatásnak.
- A PostgreSQL csak a belső `database` hálózaton érhető el, nyilvános portja nincs.
- A Cloudflare kezeli a nyilvános HTTPS-kapcsolatot.

## DNS-átállítás

Az átállítás előtt az összes működő Rackhost DNS-rekordot át kell másolni a Cloudflare-be, különösen az MX-, SPF-, DKIM- és egyéb levelezési rekordokat. A régi Railway webrekordok nem másolandók át.

A Cloudflare által kiosztott névszerverek:

- `cameron.ns.cloudflare.com`
- `tani.ns.cloudflare.com`

Csak a DNS-rekordok ellenőrzése után szabad a Rackhostnál a domain névszervereit ezekre cserélni.

## Üzemeltetés

- A szervernek csak működő kimenő internetkapcsolat és DNS-feloldás kell.
- Másik Wi-Fi vagy mobilinternet használatakor a Tunnel automatikusan újracsatlakozik; a publikus DNS-t nem kell módosítani.
- A `restart: unless-stopped` beállítás miatt a Tunnel a Dockerrel együtt automatikusan újraindul.
- A Caddy csak a belső Docker-hálózat `8080` portján figyel; közvetlen nyilvános hostportja nincs.

## Ellenőrzés

1. `docker compose ps` alatt az `app`, `db`, `caddy` és `cloudflared` szolgáltatás fusson.
2. A Cloudflare Tunnel állapota legyen `healthy`.
3. Névszerver-átállítás után a `https://ganzportalok.hu/api/health` adjon sikeres választ.
4. Külső hálózatról is tesztelni kell a webes és e-mailes folyamatokat.
