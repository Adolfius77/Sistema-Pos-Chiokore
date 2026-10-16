# Instalar el POS en otra PC con Docker

Las imágenes **no traen ninguna IP fija**: el front arma la URL del backend con la
IP con la que lo abras (`http://<esa-ip>:8082`) y el backend acepta peticiones del
front desde cualquier IP (puertos 5175 y 5173). Funciona igual con `localhost`,
`192.168.x.x`, `10.x.x.x`, etc., sin reconstruir nada.

## 1. En la PC donde está el código: generar las imágenes

Windows (PowerShell, desde la raíz del repo):

```powershell
.\despliegue\exportar-imagenes.ps1
```

Linux / Git Bash:

```bash
./despliegue/exportar-imagenes.sh
```

Se genera `despliegue/chiokore-pos-imagenes.tar` (o `.tar.gz`) con el backend, el
front y MySQL 8.4.

## 2. Llevar a la otra PC (USB, red, etc.)

Una carpeta con estos 3 archivos:

- `chiokore-pos-imagenes.tar` (o `.tar.gz`)
- `docker-compose.yml`
- `.env.example`

## 3. En la otra PC (solo necesita Docker Desktop)

```powershell
cd C:\ruta\a\la\carpeta
docker load -i chiokore-pos-imagenes.tar      # o .tar.gz, docker lo entiende igual
copy .env.example .env                         # Linux: cp .env.example .env
notepad .env                                   # cambia contraseñas y llaves
docker compose up -d
```

Abrir:

- En la misma PC: <http://localhost:5175>
- Desde tablets/teléfonos de la red: `http://<IP-de-esa-PC>:5175`
  (la IP la ves con `ipconfig`).

## Firewall de Windows

Si desde otro dispositivo no carga, abre los puertos 5175 y 8082 (PowerShell como
administrador):

```powershell
New-NetFirewallRule -DisplayName "POS Chiokore" -Direction Inbound -Protocol TCP -LocalPort 5175,8082 -Action Allow
```

## Comandos útiles

```powershell
docker compose ps              # ver que los 3 contenedores estén arriba
docker compose logs -f backend # ver logs del backend
docker compose down            # apagar (los datos se conservan en los volúmenes)
```

Para actualizar a una versión nueva: repite el paso 1, copia el `.tar` nuevo,
`docker load -i ...` y `docker compose up -d`.
