# Frontend - Sistema POS Chiokore

Aplicación React + Vite para el flujo de venta (categorías, catálogo, carrito y cobro).

## Requisitos

- Node.js 20+
- Backend corriendo en el proyecto `backend/`

## Variables de entorno

Crea un archivo `.env` en `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_KEYCLOAK_URL=http://localhost:9090
VITE_KEYCLOAK_REALM=sistema-pos-chiokore
VITE_KEYCLOAK_CLIENT_ID=react-app-client
VITE_DEFAULT_USUARIO_ID=1
VITE_ENABLE_KEYCLOAK=true
```

## Scripts

```powershell
npm install
npm run dev
npm run lint
npm run build
```

> Nota: actualmente no existe script `test` en `package.json`.
