#!/usr/bin/env bash
# Construye las imagenes del POS y las guarda en un solo archivo .tar
# para llevarlas a otra PC. Uso: ./despliegue/exportar-imagenes.sh
set -euo pipefail
dir="$(cd "$(dirname "$0")" && pwd)"
raiz="$(dirname "$dir")"

docker build -t chiokore-pos-backend:latest "$raiz/backend"
docker build -t chiokore-pos-frontend:latest "$raiz/frontend"
docker pull mysql:8.4

docker save mysql:8.4 chiokore-pos-backend:latest chiokore-pos-frontend:latest | gzip > "$dir/chiokore-pos-imagenes.tar.gz"
echo "Listo: $dir/chiokore-pos-imagenes.tar.gz"
echo "Copia a la otra PC: ese archivo, docker-compose.yml y .env.example de la carpeta despliegue"
