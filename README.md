# Sistema Pos Chiokore

Sistema de punto de venta (POS). Monorepo con backend en Spring Boot y frontend en React (Vite).

Estructura
- backend/  — Java + Spring Boot (Maven)
- frontend/ — React + Vite

Requisitos (local)
- JDK 21 (requerido)
- Maven (o usar el wrapper incluido)
- Node 18+ y npm

Arrancar en tu máquina (Windows)
1) Backend
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
O empaquetar y ejecutar jar:
```powershell
cd backend
.\mvnw.cmd clean package
java -jar target/*.jar
```
2) Frontend
```powershell
cd frontend
npm install
npm run dev
```

Variables importantes
- Frontend (`frontend/.env`):
  - VITE_API_BASE_URL=http://localhost:8082
  - VITE_AUTH_TOKEN_KEY=token_pos_chiokore
  - VITE_AUTH_ROLE_KEY=rol_pos_chiokore
- Backend (`application.properties` / env):
  - asistencia.api.token = <JWT_SECRET_HS256>
  - server.port (por defecto 8082)

Uso básico
- Abrir frontend en la URL que indique Vite (por defecto http://localhost:5175) y autenticarse.
- Las rutas administrativas requieren rol; el cliente inyecta el JWT desde localStorage.

Endpoints principales
- POST /api/ventas/{id}/cancelar
- POST /api/ventas/{id}/recalcular
- POST /api/ventas/recalcular-totales
- POST /api/ventas/recalcular-precios
- GET  /api/debug/claims (dev)

Uploads
- Archivos subidos se sirven desde `/uploads/**`. Ajustar `ImageStorageService` si cambia la ubicación física.

