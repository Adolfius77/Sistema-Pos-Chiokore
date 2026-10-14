# Tutorial: dockerizar el backend del POS Chiokore

Esta guía es para quien **nunca ha usado Docker**. Al final vas a poder levantar el
backend (Spring Boot) **y** su base de datos MySQL con un solo comando, sin instalar
Java, Maven ni MySQL en la máquina.

Los archivos ya están en el repositorio; aquí se explica qué hace cada uno y cómo
usarlos.

---

## 1. Los conceptos (en 2 minutos)

| Palabra | Qué es | Analogía |
|---|---|---|
| **Imagen** | Un paquete con todo lo necesario para correr tu app: sistema base, Java y tu `.jar`. Es de solo lectura. | El instalador de un programa. |
| **Contenedor** | Una imagen **ejecutándose**. Puedes tener varios de la misma imagen. | El programa ya abierto. |
| **Dockerfile** | La receta para construir la imagen, paso por paso. | La receta de cocina. |
| **Volumen** | Una carpeta que vive **fuera** del contenedor. Lo que guardes ahí sobrevive aunque borres el contenedor. | Un disco externo conectado. |
| **Docker Compose** | Un archivo (`docker-compose.yml`) que describe **varios** contenedores y cómo se conectan, para levantarlos todos juntos. | El "control remoto" que prende todo. |

La idea clave: **un contenedor es desechable**. Se borra y se vuelve a crear todo el
tiempo. Por eso todo lo que deba persistir (la base de datos, las imágenes subidas)
va en **volúmenes**.

---

## 2. Instalar Docker en Windows

1. Descarga **Docker Desktop** desde <https://www.docker.com/products/docker-desktop/> e instálalo.
   Cuando pregunte, deja marcada la opción **"Use WSL 2"**.
2. Reinicia si te lo pide y **abre Docker Desktop**. Espera a que abajo a la izquierda
   diga *Engine running* (el ícono de la ballena deja de moverse).
3. Abre PowerShell y verifica:

```powershell
docker --version
docker compose version
docker run hello-world
```

Si `hello-world` imprime *"Hello from Docker!"*, ya está listo.

> Docker Desktop tiene que estar **abierto** siempre que uses comandos `docker`.
> Si ves un error como `error during connect ... dockerDesktopLinuxEngine`, es que
> no está corriendo.

---

## 3. Los archivos que se agregaron

```
Sistema-Pos-Chiokore/
├── docker-compose.yml       ← levanta MySQL + backend juntos
├── .env.docker.example      ← plantilla de contraseñas y configuración
├── backend/
│   ├── Dockerfile           ← receta de la imagen del backend
│   └── .dockerignore        ← qué archivos NO meter en la imagen
└── docs/DOCKER.md           ← este tutorial
```

---

## 4. El `Dockerfile`, explicado

Archivo: [`backend/Dockerfile`](../backend/Dockerfile)

Usa una técnica llamada **multi-stage build** (construcción en dos etapas):

```dockerfile
# ---------- Etapa 1: compilar ----------
FROM maven:3.9-eclipse-temurin-21 AS build
```
Parte de una imagen oficial que ya trae **Maven + Java 21**. `AS build` le pone un
nombre a esta etapa para usarla después.

```dockerfile
WORKDIR /app
```
Todos los comandos siguientes se ejecutan dentro de la carpeta `/app` del contenedor
(es como hacer `cd /app`).

```dockerfile
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
```
Copia **solo** el `pom.xml` y descarga todas las dependencias. ¿Por qué separado del
código? Docker guarda cada paso en **caché**. Si cambias una clase Java pero no el
`pom.xml`, Docker reutiliza este paso y **no vuelve a descargar** cientos de MB de
librerías. Los builds pasan de minutos a segundos.

```dockerfile
COPY src ./src
RUN mvn -B -q package -DskipTests
```
Ahora sí copia el código y genera el `.jar` (igual que `mvnw package` en tu PC).
Las pruebas se saltan aquí; córrelas por separado con `.\mvnw.cmd test`.

```dockerfile
# ---------- Etapa 2: ejecutar ----------
FROM eclipse-temurin:21-jre
```
Empieza **una imagen nueva y limpia** que solo tiene el **JRE** (Java para ejecutar,
sin compilador ni Maven). Todo lo de la etapa 1 se tira, excepto lo que copiemos
explícitamente. Resultado: una imagen mucho más chica y segura.

```dockerfile
RUN groupadd --system spring \
    && useradd --system --gid spring spring \
    && mkdir -p /app/uploads \
    && chown spring:spring /app/uploads
```
Crea un usuario `spring` sin privilegios y la carpeta de imágenes subidas. Por
defecto los contenedores corren como `root`; es buena práctica no hacerlo.

```dockerfile
COPY --from=build /app/target/*.jar app.jar
```
Trae **únicamente el `.jar`** desde la etapa `build`.

```dockerfile
USER spring
ENV APP_UPLOAD_DIR=/app/uploads
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
```
- `USER spring`: a partir de aquí todo corre como ese usuario.
- `ENV`: le dice al backend dónde guardar imágenes (lo lee `application.properties`).
- `EXPOSE 8082`: documenta en qué puerto escucha la app.
- `ENTRYPOINT`: el comando que se ejecuta al arrancar el contenedor.

### `.dockerignore`

Funciona como `.gitignore`, pero para Docker: lista lo que **no** se manda al construir
la imagen (`target/`, `uploads/`, `.env`, archivos del IDE...). Así el build es más
rápido y **tus secretos del `.env` nunca terminan dentro de la imagen**.

---

## 5. El `docker-compose.yml`, explicado

Archivo: [`docker-compose.yml`](../docker-compose.yml)

Define dos **servicios** (contenedores):

### `db` — MySQL

```yaml
db:
  image: mysql:8.4
```
Usa la imagen oficial de MySQL; no hay que construir nada.

```yaml
  environment:
    MYSQL_DATABASE: VentasDB
    MYSQL_USER: ${DB_USUARIO:-usuario_pos}
    MYSQL_PASSWORD: ${DB_PASSWORD:?Falta DB_PASSWORD en el archivo .env}
```
La **primera vez** que arranca, MySQL crea la base `VentasDB` y ese usuario.
- `${DB_USUARIO:-usuario_pos}` → toma el valor del archivo `.env`; si no existe, usa `usuario_pos`.
- `${DB_PASSWORD:?mensaje}` → es **obligatorio**; si falta, Compose se detiene con ese mensaje.

```yaml
  volumes:
    - mysql-data:/var/lib/mysql
```
Los datos de MySQL se guardan en el volumen `mysql-data`. **Gracias a esto no pierdes
las ventas** al apagar o recrear el contenedor.

```yaml
  ports:
    - "127.0.0.1:3307:3306"
```
Formato `puerto_en_tu_PC:puerto_en_el_contenedor`. Te permite abrir la base con
MySQL Workbench o DBeaver en `127.0.0.1:3307`. Se usa el **3307** para no chocar con un
MySQL que ya tengas instalado en el 3306, y `127.0.0.1` para que solo tu PC (no la red)
pueda entrar.

```yaml
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "--silent"]
```
Cada 5 segundos Docker pregunta "¿MySQL ya acepta conexiones?". MySQL tarda unos
segundos en arrancar, sobre todo la primera vez.

### `backend` — Spring Boot

```yaml
backend:
  build: ./backend
```
En vez de descargar una imagen, la **construye** con `backend/Dockerfile`.

```yaml
  depends_on:
    db:
      condition: service_healthy
```
No arranca el backend hasta que el healthcheck de MySQL diga que está sano. Sin esto
el backend arrancaría antes que la base y fallaría con *Communications link failure*.

```yaml
  environment:
    SPRING_DATASOURCE_URL: "jdbc:mysql://db:3306/VentasDB?..."
```
**Lo más importante de entender:** dentro de Docker, cada contenedor es como una
computadora distinta. `localhost` dentro del contenedor del backend es **el propio
contenedor**, no tu PC ni MySQL. Compose crea una red interna donde cada servicio se
encuentra **por su nombre**: por eso la URL dice `db:3306`.

Las demás variables (`APP_JWT_SECRET`, `ADMIN_CLAVE`, etc.) son las mismas que ya usa
`application.properties`; Spring Boot las lee del entorno automáticamente.

```yaml
    ASISTENCIA_API_URL: ${ASISTENCIA_API_URL:-http://host.docker.internal:8080}
```
`host.docker.internal` es un nombre especial que significa **"la PC donde corre
Docker"**. Sirve para que el backend llegue al microservicio de asistencia si este corre
fuera de Docker, en tu misma máquina.

```yaml
    TZ: ${TZ:-America/Mexico_City}
```
Los contenedores usan la hora **UTC** por defecto. El POS fecha cada venta con la hora
del servidor, así que sin esta línea una venta de las 7 pm quedaría registrada al día
siguiente. Si la tienda está en otra zona, cámbiala en el `.env`
([lista de zonas](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)).

```yaml
  volumes:
    - uploads:/app/uploads
  ports:
    - "8082:8082"
```
Las imágenes de productos y tickets van a otro volumen, y el backend queda disponible en
`http://localhost:8082` igual que cuando lo corres con `mvnw`.

---

## 6. Paso a paso: levantarlo

Abre PowerShell **en la carpeta raíz del repositorio** (donde está `docker-compose.yml`).

### Paso 1 — Crear tu archivo `.env`

```powershell
Copy-Item .env.docker.example .env
notepad .env
```

Cambia **todos** los valores que dicen `cambiame`. Para `APP_JWT_SECRET` genera una
llave aleatoria:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

> - El `.env` está en `.gitignore`: **nunca** lo subas a git.
> - Evita el signo `$` en las contraseñas: Compose lo interpreta como variable.
> - Si ya tienes un MySQL local con datos que quieres conservar, **lee primero la
>   sección 8** antes del paso 2.

### Paso 2 — Construir y arrancar

```powershell
docker compose up -d --build
```

- `up` → crea y arranca los contenedores.
- `-d` → en segundo plano (te devuelve la terminal).
- `--build` → construye la imagen del backend con el `Dockerfile`.

La **primera vez tarda varios minutos** porque descarga Java, MySQL y todas las
dependencias de Maven. Las siguientes son mucho más rápidas gracias a la caché.

### Paso 3 — Ver que esté vivo

```powershell
docker compose ps
```

Deberías ver algo así:

```
NAME                             SERVICE   STATUS                    PORTS
sistema-pos-chiokore-backend-1   backend   Up 10 seconds             0.0.0.0:8082->8082/tcp
sistema-pos-chiokore-db-1        db        Up 26 seconds (healthy)   127.0.0.1:3307->3306/tcp
```

Y revisa los logs del backend (`Ctrl + C` para salir; el contenedor sigue corriendo):

```powershell
docker compose logs -f backend
```

Busca la línea `Started BackendApplication in X seconds`.

### Paso 4 — Probarlo

Abre en el navegador: <http://localhost:8082/api/categorias>

Deberías ver el JSON de las categorías (en una base nueva aparecen las 4 que crea
`DataSeeder`: Ropa, Electrónicos, Juguetes y Muebles).

### Paso 5 — Usarlo con el frontend

El frontend **no cambia**: sigue apuntando a `VITE_API_BASE_URL=http://localhost:8082`.
Arráncalo como siempre:

```powershell
cd frontend
npm run dev
```

---

## 7. Comandos del día a día

| Quiero... | Comando |
|---|---|
| Arrancar todo | `docker compose up -d` |
| Arrancar después de **cambiar código Java** | `docker compose up -d --build` |
| Ver si están corriendo | `docker compose ps` |
| Ver logs en vivo | `docker compose logs -f backend` |
| Reiniciar solo el backend | `docker compose restart backend` |
| Apagar todo (**los datos se conservan**) | `docker compose down` |
| Entrar a la consola de MySQL | `docker compose exec db mysql --default-character-set=utf8mb4 -u root -p VentasDB` |
| Abrir una terminal dentro del backend | `docker compose exec backend sh` |
| Ver cuánto espacio usa Docker | `docker system df` |

> ⚠️ **`docker compose down -v` BORRA LOS VOLÚMENES**: se pierde toda la base de datos y
> las imágenes subidas. Úsalo solo si de verdad quieres empezar de cero.

> En la consola de MySQL del contenedor no olvides `--default-character-set=utf8mb4`:
> sin eso el cliente usa `latin1` y los acentos y la ñ se guardan corruptos
> (`Categoría` termina como `CategorÃ­a`).

Importante: si cambias el código Java y solo haces `docker compose up -d` (sin
`--build`), seguirás corriendo **la versión vieja**. El contenedor ejecuta el `.jar`
que quedó dentro de la imagen, no tu código fuente.

---

## 8. Pasar tus datos de MySQL local a Docker

El MySQL del contenedor arranca **vacío**. Si ya tienes ventas y productos en tu MySQL
local, pásalos así **antes** de arrancar el backend por primera vez (si no, el backend
crea las tablas y los datos de ejemplo, y al importar chocarían).

**1. Exporta tu base local** (con tu MySQL de siempre, el del puerto 3306):

```powershell
mysqldump -u root -p --single-transaction --routines --triggers --result-file=respaldo.sql VentasDB
```

> Usa `--result-file` y no `> respaldo.sql`: en PowerShell la redirección `>` puede
> guardar el archivo en otra codificación y romper los acentos.

**2. Arranca solo la base de datos:**

```powershell
docker compose up -d db
```

Espera a que `docker compose ps` muestre `(healthy)` en `db`.

**3. Copia el respaldo al contenedor e impórtalo:**

```powershell
docker compose cp respaldo.sql db:/tmp/respaldo.sql
docker compose exec db sh -c 'mysql --default-character-set=utf8mb4 -u root -p"$MYSQL_ROOT_PASSWORD" VentasDB < /tmp/respaldo.sql'
```

(`$MYSQL_ROOT_PASSWORD` va entre comillas simples a propósito: así lo resuelve el
contenedor con la contraseña de tu `.env`, no PowerShell.)

**4. Ahora sí arranca todo:**

```powershell
docker compose up -d --build
```

**5. Las imágenes subidas:** si tenías imágenes en `backend/uploads`, cópialas al volumen:

```powershell
docker compose cp backend/uploads/. backend:/app/uploads/
docker compose exec -u root backend chown -R spring:spring /app/uploads
```

El segundo comando es necesario: lo que copias con `docker compose cp` queda como
propiedad de `root`, y el backend (que corre como el usuario `spring`) ya no podría
guardar imágenes nuevas en esas carpetas.

Borra `respaldo.sql` cuando termines: contiene todos tus datos.

### Respaldos de la base dentro de Docker

El script [`scripts/respaldo-bd.sh`](../scripts/README.md) funciona igual contra el
contenedor; solo apúntalo al puerto publicado:

```bash
BD_HOST=127.0.0.1 BD_PUERTO=3307 BD_USUARIO=usuario_pos BD_PASSWORD='...' ./scripts/respaldo-bd.sh
```

---

## 9. Problemas comunes

**`required variable DB_PASSWORD is missing a value: Falta DB_PASSWORD en el archivo .env`**
No existe el `.env` o le falta esa línea. Revisa el paso 1 y que estés en la carpeta
raíz del repositorio.

**`Bind for 0.0.0.0:8082 failed: port is already allocated`**
Ya hay algo usando el puerto 8082, casi siempre **el backend corriendo desde IntelliJ o
`mvnw`**. Detenlo y vuelve a intentar. Lo mismo con el 3307 para MySQL.

**Cambié `DB_PASSWORD` en el `.env` y ahora sale `Access denied for user`**
MySQL solo lee esas variables **la primera vez**, cuando el volumen está vacío. Después
la contraseña ya quedó guardada en el volumen. Opciones:
- Regresa el `.env` a la contraseña anterior, **o**
- Cámbiala dentro de MySQL:
  `docker compose exec db mysql -u root -p -e "ALTER USER 'usuario_pos'@'%' IDENTIFIED BY 'nueva';"`, **o**
- Si es una base de pruebas sin datos importantes: `docker compose down -v` y vuelve a levantar (⚠️ borra todo).

**El backend se reinicia una y otra vez**
Mira por qué: `docker compose logs backend`. Lo más común es una variable mal escrita
en el `.env` o un `APP_JWT_SECRET` demasiado corto (mínimo 32 caracteres).

**`Error al comunicarse con Asistencia: ... Connection refused`**
El backend no encuentra el microservicio de asistencia. **No es fatal**: el POS sigue
funcionando, solo no sincroniza usuarios. Verifica que ese servicio esté corriendo y que
`ASISTENCIA_API_URL` en el `.env` sea correcta (si corre en otra PC, usa su IP:
`http://192.168.1.50:8080`).

**Las tablets/teléfonos no pueden conectarse al backend**
- Desde la tablet usa la **IP de tu PC** (ej. `http://192.168.1.77:8082`), no `localhost`.
- Revisa que el Firewall de Windows permita conexiones entrantes al puerto 8082.
- Si el frontend se abre desde otro origen, agrégalo a `APP_CORS_ALLOWED_ORIGINS` en el `.env`.

**Las ventas salen con la hora equivocada**
Revisa la variable `TZ` en el `.env` y reinicia con `docker compose up -d`.

**Docker se está comiendo el disco**
Las imágenes viejas se acumulan con cada `--build`. Limpia las que no se usan:
`docker image prune`. (No toca los volúmenes ni tus datos.)

---

## 10. ¿Qué sigue?

Cuando te sientas cómodo con esto, los siguientes pasos naturales son:

1. **Dockerizar el frontend** con otra etapa que haga `npm run build` y sirva la carpeta
   `dist/` con Nginx, y agregarlo como tercer servicio al `docker-compose.yml`.
2. **Healthcheck del backend**: permitir sin token `/actuator/health` en `SecurityConfig`
   y usarlo para que Docker sepa si la app está sana, no solo si el proceso existe.
3. **Publicar la imagen** en un registro (Docker Hub o GitHub Container Registry) para que
   el servidor de la tienda solo haga `docker compose pull` en vez de compilar.
