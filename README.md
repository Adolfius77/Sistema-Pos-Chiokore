# Sistema Pos Chiokore

Monorepo con dos proyectos separados:

- `backend/` → Spring Boot + Maven
- `frontend/` → React + Vite

## Ejecutar backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

## Ejecutar frontend

```powershell
cd frontend
npm install
npm run dev
```

## Configuración frontend (.env)

En `frontend/README.md` está el detalle completo. Variables mínimas:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_KEYCLOAK_URL=http://localhost:9090
VITE_KEYCLOAK_REALM=sistema-pos-chiokore
VITE_KEYCLOAK_CLIENT_ID=react-app-client
VITE_DEFAULT_USUARIO_ID=1
VITE_ENABLE_KEYCLOAK=true
```
