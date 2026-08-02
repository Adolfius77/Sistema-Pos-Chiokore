# Sistema Pos Chiokore

Punto de venta (POS) — Monorepo con backend Spring Boot y frontend React (Vite).

Estructura:
- backend/  — Java 17+, Spring Boot, Maven
- frontend/ — React + Vite, Node 18+

Requisitos:
- Java 17+, Maven (o usar el wrapper), Node 18+, npm

Inicio rápido (Windows):
1) Backend
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
2) Frontend
```powershell
cd frontend
npm install
npm run dev
```

Variables importantes (frontend .env — `frontend/.env`):
- VITE_API_BASE_URL=http://localhost:8082   # sin "/api" al final
- VITE_AUTH_TOKEN_KEY=token_pos_chiokore     # clave localStorage donde se guarda el JWT
- VITE_AUTH_ROLE_KEY=rol_pos_chiokore
- Otros: VITE_URL_LOGIN_EXTERNO, VITE_URL_LOGOUT_EXTERNO según integración

Backend — variables (application.properties / environment):
- asistencia.api.token = <JWT_SECRET_HS256>
- Configura puerto (server.port) y rutas de uploads si cambia.

Endpoints principales:
- POST /api/ventas/{id}/cancelar       — Cancelar venta (restaura stock)
- POST /api/ventas/{id}/recalcular     — Recalcula total de una venta
- POST /api/ventas/recalcular-totales  — Recalcula totales para todas las ventas (hacer backup antes)
- POST /api/ventas/recalcular-precios  — Recalcula precios históricos desde producto/detalles
- GET  /api/debug/claims               — Dev-only: devuelve claims del JWT

Recomendaciones básicas:
- Hacer backup de la base de datos antes de ejecutar operaciones masivas (recalcular-totales / recalcular-precios).
- Reiniciar el backend después de cambiar configuración de seguridad o recursos estáticos.

Contribuir / Git
- Sigue la convención del repo. Al crear commits, incluye el trailer:
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

Cambios recientes relevantes
- Endpoint de cancelación de ventas, manejo de ventas pendientes (pagos parciales), recalculadores de precios/totales, mejoras en export Excel y hardening de JWT/CORS.

¿Deseas un README en inglés o ejemplos curl para los endpoints principales? Si prefieres, creo un CONTRIBUTING.md separado.