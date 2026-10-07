# Nyilvános hálózati elérés VirtualBox NAT mögül

A virtuális gép jelenleg VirtualBox NAT hálózaton fut (`10.0.2.15`), ezért a Caddy 80/443 portjai önmagukban nem érhetők el az internetről. Az SSH-hoz használt `127.0.0.1:2222` ugyanennek a porttovábbításnak egy meglévő példája.

## 1. VirtualBox porttovábbítás a Windows-gazdagépen

Rendszergazdai PowerShellben listázza a futó VM pontos nevét:

```powershell
$VBoxManage = "$env:ProgramFiles\Oracle\VirtualBox\VBoxManage.exe"
& $VBoxManage list runningvms
```

Ezután a `VM_PONTOS_NEVE` helyére a listában látott nevet írva:

```powershell
& $VBoxManage controlvm "VM_PONTOS_NEVE" natpf1 "ganz-http,tcp,,80,,80"
& $VBoxManage controlvm "VM_PONTOS_NEVE" natpf1 "ganz-https,tcp,,443,,443"
```

A szabályok ellenőrzése:

```powershell
& $VBoxManage showvminfo "VM_PONTOS_NEVE" --machinereadable | Select-String Forwarding
```

## 2. Windows tűzfal és internetes router

- A Windows tűzfalon engedélyezni kell a bejövő TCP 80 és 443 portot a VirtualBox folyamat számára.
- Ha a Windows-gép router mögött van, a routeren a TCP 80 és 443 portot a Windows-gép helyi IPv4-címére kell továbbítani.
- CGNAT esetén közvetlen bejövő kapcsolat nem lehetséges; ilyenkor publikus IPv4-címet kell kérni a szolgáltatótól.

## 3. Átállítási sorrend

1. A porttovábbítások beállítása.
2. Külső hálózatról a 80/443 port ellenőrzése.
3. Csak ezután a `ganzportalok.hu` és `www.ganzportalok.hu` A rekordjainak átállítása a nyilvános IPv4-címre.
4. A Caddy HTTPS-tanúsítvány kiadásának és a `/api/health` végpontnak az ellenőrzése.

Az MX-, SPF- és DKIM-rekordokat a webes átállítás nem érinti.
