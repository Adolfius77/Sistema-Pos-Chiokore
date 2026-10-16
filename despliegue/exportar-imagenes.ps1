# Construye las imagenes del POS y las guarda en un solo archivo .tar
# para llevarlas a otra PC. Correr desde la raiz del repo:
#   .\despliegue\exportar-imagenes.ps1
$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot

docker build -t chiokore-pos-backend:latest "$raiz\backend"
docker build -t chiokore-pos-frontend:latest "$raiz\frontend"
docker pull mysql:8.4

$salida = Join-Path $PSScriptRoot "chiokore-pos-imagenes.tar"
docker save -o $salida chiokore-pos-backend:latest chiokore-pos-frontend:latest mysql:8.4
Write-Host "Listo: $salida"
Write-Host "Copia a la otra PC: ese .tar, docker-compose.yml y .env.example de la carpeta despliegue"
