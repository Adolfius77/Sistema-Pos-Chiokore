#!/usr/bin/env bash
#
# respaldo-bd.sh - Respaldo comprimido de la base MySQL de ventas del POS Chiokore.
#
# Filosofia de este script: FALLA RUIDOSAMENTE. Un respaldo vacio que parece
# exitoso es peor que no tener respaldo, porque da una falsa sensacion de
# seguridad hasta el dia que hay que restaurar. Por eso el volcado se escribe
# primero en un archivo temporal y solo recibe su nombre definitivo cuando pasa
# TODAS las validaciones.
#
# Uso:
#   BD_PASSWORD='...' ./scripts/respaldo-bd.sh
#
# Ver scripts/README.md para el cron diario y como probar una restauracion.

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuracion: todo sale del entorno, con valores por defecto razonables.
# La contrasena NUNCA se escribe en este archivo ni se pasa por linea de
# comandos (seria visible para cualquiera con `ps aux`): se le entrega a
# mysqldump mediante un archivo temporal con permisos 600.
# ---------------------------------------------------------------------------
BD_HOST="${BD_HOST:-localhost}"
BD_PUERTO="${BD_PUERTO:-3306}"
BD_USUARIO="${BD_USUARIO:-root}"
BD_NOMBRE="${BD_NOMBRE:-VentasDB}"

# Carpeta destino. Debe estar en OTRO disco o montada desde la nube: un
# respaldo en el mismo disco que la base no sobrevive a que ese disco muera.
RESPALDO_DESTINO="${RESPALDO_DESTINO:-/var/respaldos/chiokore}"

# Cuantos respaldos se conservan. Los mas viejos se borran al final.
RESPALDO_CONSERVAR="${RESPALDO_CONSERVAR:-7}"

# Tamano minimo aceptable del archivo comprimido, en bytes. Un .sql.gz de la
# base de ventas pesa varios KB; si sale por debajo de esto, algo fallo.
RESPALDO_TAMANO_MINIMO="${RESPALDO_TAMANO_MINIMO:-1024}"

# Binario de mysqldump, por si esta fuera del PATH habitual.
MYSQLDUMP_BIN="${MYSQLDUMP_BIN:-mysqldump}"

# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------

# Mensajes con fecha, para que el log de cron sea legible.
log() {
    printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

# Mensaje de error a stderr y salida con codigo distinto de cero.
morir() {
    printf '[%s] ERROR: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2
    exit 1
}

# Tamano de un archivo en bytes, portable entre GNU (Linux) y BSD (macOS).
tamano_bytes() {
    stat -c '%s' "$1" 2>/dev/null || stat -f '%z' "$1"
}

# Archivos temporales que hay que limpiar pase lo que pase (exito, error o
# Ctrl+C). Sin esto, un fallo dejaria la contrasena en el temporal del sistema
# y volcados a medias ocupando disco.
ARCHIVO_CREDENCIALES=""
ARCHIVO_TEMPORAL=""
ARCHIVO_ERRORES=""
limpiar() {
    [[ -n "$ARCHIVO_CREDENCIALES" ]] && rm -f -- "$ARCHIVO_CREDENCIALES"
    [[ -n "$ARCHIVO_TEMPORAL" ]] && rm -f -- "$ARCHIVO_TEMPORAL"
    [[ -n "$ARCHIVO_ERRORES" ]] && rm -f -- "$ARCHIVO_ERRORES"
    return 0
}
trap limpiar EXIT INT TERM

# ---------------------------------------------------------------------------
# Validaciones previas: mejor fallar aqui que a mitad del volcado.
# ---------------------------------------------------------------------------

command -v "$MYSQLDUMP_BIN" >/dev/null 2>&1 ||
    morir "no se encontro '$MYSQLDUMP_BIN' en el PATH. Instala el cliente de MySQL o define MYSQLDUMP_BIN."

command -v gzip >/dev/null 2>&1 ||
    morir "no se encontro 'gzip' en el PATH."

# Se distingue "no definida" de "definida pero vacia": hay instalaciones de
# desarrollo con usuario sin contrasena, y eso debe ser una decision explicita.
if [[ -z "${BD_PASSWORD+definida}" ]]; then
    morir "falta la variable BD_PASSWORD. Exportala antes de ejecutar; en este script no se escriben contrasenas. Si el usuario de verdad no tiene contrasena, pasa BD_PASSWORD= vacia de forma explicita."
fi

# RESPALDO_CONSERVAR tiene que ser un entero >= 1, o la rotacion borraria todo.
if ! [[ "$RESPALDO_CONSERVAR" =~ ^[0-9]+$ ]] || ((RESPALDO_CONSERVAR < 1)); then
    morir "RESPALDO_CONSERVAR debe ser un entero mayor o igual a 1 (valor recibido: '$RESPALDO_CONSERVAR')."
fi

if ! [[ "$RESPALDO_TAMANO_MINIMO" =~ ^[0-9]+$ ]]; then
    morir "RESPALDO_TAMANO_MINIMO debe ser un entero de bytes (valor recibido: '$RESPALDO_TAMANO_MINIMO')."
fi

# La carpeta destino se crea si no existe; si no se puede, se aborta.
mkdir -p -- "$RESPALDO_DESTINO" ||
    morir "no se pudo crear la carpeta de destino '$RESPALDO_DESTINO'."
[[ -w "$RESPALDO_DESTINO" ]] ||
    morir "la carpeta de destino '$RESPALDO_DESTINO' no tiene permiso de escritura."

# ---------------------------------------------------------------------------
# Credenciales: archivo temporal 600 que solo puede leer quien ejecuta.
# ---------------------------------------------------------------------------
ARCHIVO_CREDENCIALES="$(mktemp)"
chmod 600 "$ARCHIVO_CREDENCIALES"
{
    printf '[client]\n'
    printf 'user=%s\n' "$BD_USUARIO"
    printf 'password=%s\n' "$BD_PASSWORD"
    printf 'host=%s\n' "$BD_HOST"
    printf 'port=%s\n' "$BD_PUERTO"
} >"$ARCHIVO_CREDENCIALES"

# ---------------------------------------------------------------------------
# El volcado
# ---------------------------------------------------------------------------
MARCA_TIEMPO="$(date '+%Y-%m-%d_%H%M%S')"
ARCHIVO_FINAL="${RESPALDO_DESTINO}/${BD_NOMBRE}_${MARCA_TIEMPO}.sql.gz"
ARCHIVO_TEMPORAL="${ARCHIVO_FINAL}.parcial"
ARCHIVO_ERRORES="$(mktemp)"

log "Respaldando '${BD_NOMBRE}' desde ${BD_HOST}:${BD_PUERTO} hacia ${ARCHIVO_FINAL}"

# --single-transaction hace el volcado dentro de una transaccion consistente en
# lugar de bloquear las tablas: la caja puede seguir vendiendo mientras corre.
# --quick evita cargar tablas enteras en memoria; --routines, --triggers y
# --events para no perder procedimientos, disparadores ni eventos programados.
# Los errores de mysqldump se guardan aparte para poder mostrarlos si falla.
codigo_salida=0
"$MYSQLDUMP_BIN" \
    --defaults-extra-file="$ARCHIVO_CREDENCIALES" \
    --single-transaction \
    --quick \
    --routines \
    --triggers \
    --events \
    --default-character-set=utf8mb4 \
    -- "$BD_NOMBRE" 2>"$ARCHIVO_ERRORES" | gzip -c >"$ARCHIVO_TEMPORAL" || codigo_salida=$?

# Con `set -o pipefail`, si mysqldump falla el pipeline completo falla aunque
# gzip haya terminado bien y ya exista un .parcial en disco. Ese .parcial se
# borra en la limpieza y nunca llega a llamarse como un respaldo valido.
if ((codigo_salida != 0)); then
    detalle="$(tr -d '\r' <"$ARCHIVO_ERRORES" | grep -v '^$' | head -3 | tr '\n' ' ')"
    morir "mysqldump fallo con codigo ${codigo_salida}; NO se genero respaldo. Detalle: ${detalle:-sin mensaje de mysqldump}"
fi

# ---------------------------------------------------------------------------
# Validaciones del resultado. Aqui es donde se atrapa el "respaldo vacio que
# parece exitoso": codigo de salida 0 pero archivo inservible.
# ---------------------------------------------------------------------------

[[ -f "$ARCHIVO_TEMPORAL" ]] ||
    morir "mysqldump termino bien pero no se genero el archivo '$ARCHIVO_TEMPORAL'."

tamano="$(tamano_bytes "$ARCHIVO_TEMPORAL")"
if ((tamano < RESPALDO_TAMANO_MINIMO)); then
    morir "el respaldo pesa ${tamano} bytes, por debajo del minimo de ${RESPALDO_TAMANO_MINIMO}. Se descarta por sospechoso (base vacia o volcado truncado)."
fi

# El .gz no debe estar corrupto ni cortado a la mitad.
gzip -t "$ARCHIVO_TEMPORAL" 2>/dev/null ||
    morir "el archivo comprimido esta corrupto o incompleto. Se descarta."

# mysqldump escribe "-- Dump completed on ..." como ultima linea SOLO cuando
# termino de verdad. Si esa marca no esta, el volcado quedo a medias.
if ! gzip -dc "$ARCHIVO_TEMPORAL" | tail -3 | grep -q -- '-- Dump completed'; then
    morir "el volcado no contiene la marca final '-- Dump completed': quedo truncado. Se descarta."
fi

# Solo ahora, con todo validado, el respaldo recibe su nombre definitivo.
mv -- "$ARCHIVO_TEMPORAL" "$ARCHIVO_FINAL"
ARCHIVO_TEMPORAL=""
chmod 600 "$ARCHIVO_FINAL"
log "Respaldo correcto: ${ARCHIVO_FINAL} (${tamano} bytes)"

# ---------------------------------------------------------------------------
# Rotacion: conservar los ultimos N y borrar el resto.
# El nombre lleva la fecha como YYYY-MM-DD_HHMMSS, asi que ordenar por nombre
# equivale a ordenar por fecha, sin depender de la fecha del sistema de
# archivos (que se pierde al copiar los respaldos a otro disco o a la nube).
# ---------------------------------------------------------------------------
respaldos=()
while IFS= read -r nombre; do
    respaldos+=("$nombre")
done < <(
    find "$RESPALDO_DESTINO" -maxdepth 1 -type f -name "${BD_NOMBRE}_*.sql.gz" -exec basename {} \; |
        sort -r
)

total="${#respaldos[@]}"
if ((total > RESPALDO_CONSERVAR)); then
    for ((i = RESPALDO_CONSERVAR; i < total; i++)); do
        rm -f -- "${RESPALDO_DESTINO}/${respaldos[i]}"
        log "Rotacion: eliminado respaldo antiguo ${respaldos[i]}"
    done
    log "Rotacion: se conservan los ${RESPALDO_CONSERVAR} mas recientes de ${total}."
else
    log "Rotacion: hay ${total} respaldo(s), nada que eliminar (limite ${RESPALDO_CONSERVAR})."
fi

log "Listo."
