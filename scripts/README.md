# Scripts de operación — Sistema POS Chiokore

## `respaldo-bd.sh`

Genera un volcado comprimido de la base MySQL de ventas (`VentasDB`), lo valida y
rota los respaldos viejos.

El script **falla ruidosamente**: si `mysqldump` devuelve error, si el archivo sale
más chico de lo razonable, si el `.gz` está corrupto o si al volcado le falta la marca
final `-- Dump completed`, el script **borra el archivo y termina con código distinto de
cero**. Nunca deja un `.sql.gz` con nombre de respaldo válido que en realidad esté vacío
o truncado: escribe en `NOMBRE.sql.gz.parcial` y solo lo renombra al final, cuando ya
pasó todas las validaciones.

### Variables de entorno

| Variable | Por defecto | Para qué sirve |
|---|---|---|
| `BD_PASSWORD` | *(obligatoria)* | **Secreto.** Contraseña del usuario de MySQL. Sin ella el script aborta. |
| `BD_HOST` | `localhost` | Host del servidor MySQL. |
| `BD_PUERTO` | `3306` | Puerto del servidor MySQL. |
| `BD_USUARIO` | `root` | Usuario de MySQL con permisos de lectura sobre la base. |
| `BD_NOMBRE` | `VentasDB` | Nombre de la base a respaldar. |
| `RESPALDO_DESTINO` | `/var/respaldos/chiokore` | Carpeta donde se guardan los `.sql.gz`. **Cámbiala** (ver más abajo). |
| `RESPALDO_CONSERVAR` | `7` | Cuántos respaldos se conservan; los más viejos se borran. |
| `RESPALDO_TAMANO_MINIMO` | `1024` | Bytes mínimos del `.sql.gz`. Por debajo de eso se considera fallido. |
| `MYSQLDUMP_BIN` | `mysqldump` | Ruta a `mysqldump` si no está en el `PATH`. |

La contraseña **nunca** se pasa por línea de comandos (sería visible con `ps aux` para
cualquier usuario de la máquina): se escribe en un archivo temporal con permisos `600`
que se borra al terminar, pase lo que pase.

### Uso manual

```bash
chmod +x scripts/respaldo-bd.sh

BD_USUARIO=usuario_pos \
BD_PASSWORD='la-contrasena-real' \
RESPALDO_DESTINO=/mnt/respaldos/chiokore \
RESPALDO_CONSERVAR=14 \
./scripts/respaldo-bd.sh
```

Salida esperada:

```
[2026-09-17 02:00:01] Respaldando 'VentasDB' desde localhost:3306 hacia /mnt/respaldos/chiokore/VentasDB_2026-09-17_020001.sql.gz
[2026-09-17 02:00:04] Respaldo correcto: /mnt/respaldos/chiokore/VentasDB_2026-09-17_020001.sql.gz (412839 bytes)
[2026-09-17 02:00:04] Rotación: se conservan los 14 más recientes de 15.
[2026-09-17 02:00:04] Listo.
```

> **Nota para Windows.** Este es un script de shell; en el servidor de la caja
> corre bajo Linux, WSL o Git Bash. Si lo agregas a git desde Windows, el bit de
> ejecución no viaja solo — márcalo una vez con:
> `git add scripts/respaldo-bd.sh && git update-index --chmod=+x scripts/respaldo-bd.sh`

---

## Programarlo con cron (diario)

`cron` corre con un entorno casi vacío: no hereda tu `PATH` ni tus variables, y no
sabe nada de `BD_PASSWORD`. Por eso las credenciales van en un archivo aparte, fuera
del repositorio, con permisos cerrados.

**1. Crear el archivo de configuración** (fuera de git, solo legible por root):

```bash
sudo mkdir -p /etc/chiokore
sudo tee /etc/chiokore/respaldo.env >/dev/null <<'EOF'
BD_HOST=localhost
BD_PUERTO=3306
BD_USUARIO=usuario_pos
BD_PASSWORD=la-contrasena-real
BD_NOMBRE=VentasDB
RESPALDO_DESTINO=/mnt/respaldos/chiokore
RESPALDO_CONSERVAR=14
EOF
sudo chown root:root /etc/chiokore/respaldo.env
sudo chmod 600 /etc/chiokore/respaldo.env
```

**2. Dar al usuario de MySQL solo lo que necesita.** El respaldo no requiere permisos
de escritura:

```sql
CREATE USER 'usuario_respaldo'@'localhost' IDENTIFIED BY 'otra-contrasena';
GRANT SELECT, SHOW VIEW, TRIGGER, EVENT, LOCK TABLES, PROCESS ON *.* TO 'usuario_respaldo'@'localhost';
FLUSH PRIVILEGES;
```

**3. Agregar la entrada de cron** con `sudo crontab -e`:

```cron
# Correo de aviso si el respaldo falla (cron manda un mail con lo que salga por stderr).
MAILTO=admin@chiokore.com

# Respaldo diario de VentasDB a las 02:15, cuando el local está cerrado.
15 2 * * * set -a; . /etc/chiokore/respaldo.env; set +a; /ruta/al/repo/scripts/respaldo-bd.sh >> /var/log/chiokore-respaldo.log 2>&1
```

Qué hace cada parte:

- `15 2 * * *` — todos los días a las 02:15. Elige una hora con la caja cerrada: aunque
  `--single-transaction` no bloquea las ventas, el volcado consume disco y CPU.
- `set -a; . archivo; set +a` — carga el archivo de configuración y **exporta** cada
  variable al entorno del script. Sin `set -a` las variables existirían en el shell de
  cron pero no llegarían al script.
- `>> ... 2>&1` — deja todo en un log. Si el script falla, el mensaje de error queda
  guardado *y* cron lo manda por correo a `MAILTO`.

**4. Verificar que quedó programado y que efectivamente corre:**

```bash
sudo crontab -l                        # confirma la entrada
tail -f /var/log/chiokore-respaldo.log # revisa la salida al día siguiente
```

Si `cron` no está disponible, la alternativa moderna es un *timer* de `systemd`
(`respaldo-bd.service` + `respaldo-bd.timer` con `OnCalendar=*-*-* 02:15:00` y
`EnvironmentFile=/etc/chiokore/respaldo.env`), que además reintenta si la máquina
estaba apagada a esa hora.

**Vigila que el cron realmente corra.** Un cron que dejó de ejecutarse hace tres
semanas se ve exactamente igual que uno sano hasta el día que necesitas restaurar.
Revisa periódicamente que la fecha del respaldo más nuevo sea la de ayer:

```bash
ls -lt /mnt/respaldos/chiokore | head -3
```

---

## Por qué el destino NO puede ser la misma máquina

Un respaldo guardado en el mismo disco que la base **no es un respaldo**: es una
segunda copia del mismo punto único de falla. No te protege de:

- **El disco muere.** Es el caso más común y se lleva la base y los respaldos juntos.
- **Robo, incendio o inundación en el local.** La máquina completa desaparece, con
  todo lo que tenía adentro.
- **Ransomware.** El cifrado recorre el sistema de archivos y también cifra los `.sql.gz`
  que tiene a la mano.
- **Un error humano con permisos de root.** Un `rm -rf` en la ruta equivocada, o un
  formateo al reinstalar el sistema.

La regla práctica es **3-2-1**: 3 copias de los datos, en 2 medios distintos, y 1 de
ellas fuera del local. Para el POS eso se traduce en:

1. La base en producción en el servidor de la caja.
2. El respaldo diario en un disco externo o un NAS montado (`RESPALDO_DESTINO=/mnt/respaldos/chiokore`).
3. Una copia fuera del local, sincronizada después del respaldo:

```cron
# Después del respaldo, copiar a la nube. rclone sirve para S3, Backblaze,
# Google Drive, etc. También vale `aws s3 sync` o `rsync` a otro servidor.
45 2 * * * rclone sync /mnt/respaldos/chiokore remoto:chiokore-respaldos >> /var/log/chiokore-respaldo.log 2>&1
```

Si el destino remoto lo permite, activa **versionado y borrado bloqueado** del lado
del proveedor. Así, aunque alguien en el servidor borre o cifre los archivos locales,
la copia de la nube sigue siendo recuperable.

---

## Cómo probar que un respaldo sirve

**Un respaldo no probado no es un respaldo, es una esperanza.** El script valida que el
archivo no esté vacío ni truncado, pero eso no demuestra que MySQL pueda volver a leerlo.
La única prueba real es restaurarlo.

Se restaura en una base **distinta** (`VentasDB_prueba`), nunca sobre la de producción:
si restauras encima de la base viva y el respaldo estaba mal, destruiste los datos buenos.

Esto se puede hacer porque `mysqldump` se ejecutó sobre una sola base sin `--databases`,
así que el volcado **no** contiene `CREATE DATABASE` ni `USE`: se puede cargar en cualquier
base que elijas.

### 1. Crear una base de prueba vacía

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS VentasDB_prueba; CREATE DATABASE VentasDB_prueba CHARACTER SET utf8mb4;"
```

### 2. Restaurar el respaldo más reciente ahí

```bash
ULTIMO=$(ls -1 /mnt/respaldos/chiokore/VentasDB_*.sql.gz | sort | tail -1)
echo "Restaurando $ULTIMO"
gzip -dc "$ULTIMO" | mysql -u root -p VentasDB_prueba
```

Si este comando termina sin errores, el archivo es SQL válido y completo.

### 3. Comparar contra producción

Que cargue no basta; hay que confirmar que trajo los datos. Compara el conteo de filas
de las tablas que importan:

```bash
for tabla in productos venta detalle_venta categorias promociones usuario_asistencia; do
  echo -n "$tabla  ->  "
  mysql -u root -p -N -B -e \
    "SELECT (SELECT COUNT(*) FROM VentasDB.$tabla) AS produccion,
            (SELECT COUNT(*) FROM VentasDB_prueba.$tabla) AS respaldo;"
done
```

Los números deben coincidir, salvo por las ventas registradas *después* de la hora del
respaldo — por eso conviene comparar contra el respaldo de anoche y no contra uno de
hace una semana.

Revisa también que la venta más reciente del respaldo sea del día correcto:

```sql
SELECT MAX(fecha_hora) FROM VentasDB_prueba.venta;
```

Y que no falten los objetos que no son tablas:

```sql
SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = 'VentasDB_prueba';
SELECT COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'VentasDB_prueba';
```

### 4. Probar la aplicación contra la base restaurada (opcional pero recomendable)

La prueba definitiva es levantar el backend apuntando a la copia y entrar al POS:

```bash
SPRING_DATASOURCE_URL='jdbc:mysql://localhost:3306/VentasDB_prueba?useSSL=false&serverTimezone=UTC' \
SPRING_JPA_HIBERNATE_DDL_AUTO=validate \
SERVER_PORT=8099 \
./mvnw spring-boot:run
```

`SPRING_JPA_HIBERNATE_DDL_AUTO=validate` es importante: hace que Hibernate **verifique**
que el esquema restaurado coincide con las entidades y falle si no, en lugar de
"arreglarlo" alterando tablas y ocultar que al respaldo le faltaba algo.

### 5. Limpiar

```bash
mysql -u root -p -e "DROP DATABASE VentasDB_prueba;"
```

### Con qué frecuencia

Haz esta prueba **al menos una vez al mes**, y obligatoriamente después de cualquier
cambio en el esquema, en la versión de MySQL o en el script de respaldo. Anota la fecha
de la última restauración probada: si no la recuerdas, ya pasó demasiado tiempo.
