# ---------------------------------------------------------------------------
# dev-local.ps1 - Arranca el backend del POS en esta PC con una configuracion
# estable, leyendo backend/.env (que no se versiona).
#
# Uso, desde la raiz del repositorio:
#   .\scripts\dev-local.ps1
#
# Por que existe: las variables puestas a mano en cada terminal se pierden al
# cerrarla, y si APP_JWT_SECRET cambia entre arranques, TODAS las sesiones
# abiertas dejan de valer y el frontend empieza a recibir 401 sin explicacion.
# Cargarlas siempre del mismo archivo evita ese problema.
# ---------------------------------------------------------------------------

$ErrorActionPreference = "Stop"

$raiz = Split-Path -Parent $PSScriptRoot
$archivoEnv = Join-Path $raiz "backend\.env"

if (-not (Test-Path $archivoEnv)) {
    Write-Error "No existe $archivoEnv. Copia backend\.env.example como backend\.env y ajusta los valores."
}

# Maven necesita un JDK, no un JRE. Si JAVA_HOME no esta definido o apunta a un
# JRE, la compilacion falla con "No compiler is provided in this environment".
if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME "bin\javac.exe"))) {
    # Se pregunta la version a cada javac en vez de ordenar por nombre: por nombre,
    # "jdk1.8.0_111" gana contra "jdk-21" y se elegiria Java 8, que no compila esto.
    $jdk = Get-ChildItem "C:\Program Files\Java" -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path (Join-Path $_.FullName "bin\javac.exe") } |
        ForEach-Object {
            $salida = & (Join-Path $_.FullName "bin\javac.exe") -version 2>&1
            if ("$salida" -match "javac (\d+)") {
                [PSCustomObject]@{ Ruta = $_.FullName; Version = [int]$Matches[1] }
            }
        } |
        Where-Object { $_.Version -ge 21 } |
        # Ascendente: se toma el JDK 21 si existe, que es el que declara el pom.
        # El mas nuevo no siempre es mejor; Lombok suele fallar con JDK recientes.
        Sort-Object Version | Select-Object -First 1
    if (-not $jdk) {
        Write-Error "No se encontro ningun JDK 21 o superior en C:\Program Files\Java. El proyecto necesita Java 21. Instala uno o define JAVA_HOME a mano."
    }
    $env:JAVA_HOME = $jdk.Ruta
    Write-Host "JAVA_HOME no estaba definido; usando $($env:JAVA_HOME)" -ForegroundColor Yellow
}

# Carga cada linea VARIABLE=valor del archivo, ignorando comentarios y vacias.
# El valor se toma tal cual hasta el final de la linea: las URL JDBC llevan '='
# dentro de sus parametros y partirlas romperia la cadena de conexion.
$cargadas = 0
$omitidas = 0
foreach ($linea in Get-Content $archivoEnv) {
    $texto = $linea.Trim()
    if ($texto -eq "" -or $texto.StartsWith("#")) { continue }

    $corte = $texto.IndexOf("=")
    if ($corte -lt 1) { continue }

    $nombre = $texto.Substring(0, $corte).Trim()
    $valor = $texto.Substring($corte + 1).Trim()

    # Lo que ya venga definido en el entorno MANDA sobre el archivo, que es la
    # convencion de docker --env-file y de las librerias dotenv. Asi se puede
    # sobreescribir un valor puntual sin editar backend\.env, por ejemplo:
    #     `$env:SERVER_PORT=8083; .\scripts\dev-local.ps1
    if (Test-Path "Env:$nombre") {
        $omitidas++
        continue
    }

    Set-Item -Path "Env:$nombre" -Value $valor
    $cargadas++
}

Write-Host "Cargadas $cargadas variables desde backend\.env" -ForegroundColor Green
if ($omitidas -gt 0) {
    Write-Host "$omitidas venian ya definidas en el entorno y se respetaron." -ForegroundColor Yellow
}

# app.upload.dir por defecto es "./uploads", relativo al directorio de trabajo.
# Como este script arranca Maven dentro de backend\, esa ruta caia en
# backend\uploads mientras las imagenes de la base viven en uploads\ de la raiz:
# el resultado eran fotos y tickets rotos. Se fija una ruta absoluta para que no
# dependa de donde se lance el backend.
if (-not $env:APP_UPLOAD_DIR) {
    $env:APP_UPLOAD_DIR = Join-Path $raiz "uploads"
}

Write-Host "Puerto: $($env:SERVER_PORT)  |  Base: $($env:SPRING_DATASOURCE_URL -replace '\?.*','')" -ForegroundColor Cyan
Write-Host "Uploads: $($env:APP_UPLOAD_DIR)" -ForegroundColor Cyan

# Si el puerto ya esta tomado, Spring Boot falla con un volcado largo en el que
# la causa real queda enterrada. Mejor detectarlo aqui y decir quien lo ocupa.
$puerto = if ($env:SERVER_PORT) { [int]$env:SERVER_PORT } else { 8082 }
$enUso = Get-NetTCPConnection -State Listen -LocalPort $puerto -ErrorAction SilentlyContinue | Select-Object -First 1
if ($enUso) {
    $duenio = Get-Process -Id $enUso.OwningProcess -ErrorAction SilentlyContinue
    $nombre = if ($duenio) { "$($duenio.ProcessName) (PID $($duenio.Id))" } else { "PID $($enUso.OwningProcess)" }
    Write-Host ""
    Write-Host "El puerto $puerto ya esta ocupado por $nombre." -ForegroundColor Red
    Write-Host "Seguramente hay otro backend corriendo. Detenlo con:" -ForegroundColor Yellow
    Write-Host "    Stop-Process -Id $($enUso.OwningProcess) -Force" -ForegroundColor Yellow
    Write-Host "O arranca este en otro puerto:  `$env:SERVER_PORT=8083; .\scripts\dev-local.ps1" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Set-Location (Join-Path $raiz "backend")
& .\mvnw.cmd spring-boot:run
