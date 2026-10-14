# ============================================================================
# Imagen Docker del BACKEND (Spring Boot 4 / Java 21)
#
# Se construye en DOS etapas:
#   1) "build": una imagen con Maven + JDK compila el proyecto y genera el .jar.
#   2) imagen final: solo un JRE (sin Maven, sin codigo fuente) que ejecuta el .jar.
# Asi la imagen final pesa mucho menos y no lleva herramientas de compilacion.
#
# Ver docs/DOCKER.md para el tutorial completo.
# ============================================================================

# ---------- Etapa 1: compilar ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Primero solo el pom.xml: Docker guarda en cache esta capa y, mientras el pom
# no cambie, no vuelve a descargar todas las dependencias en cada build.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Ahora si el codigo fuente. Las pruebas se corren aparte con ./mvnw test.
COPY src ./src
RUN mvn -B -q package -DskipTests

# ---------- Etapa 2: ejecutar ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# No correr la aplicacion como root dentro del contenedor.
RUN groupadd --system spring \
    && useradd --system --gid spring spring \
    && mkdir -p /app/uploads \
    && chown spring:spring /app/uploads

COPY --from=build /app/target/*.jar app.jar

USER spring

# Las imagenes subidas se guardan aqui; docker-compose monta un volumen encima
# para que no se pierdan al recrear el contenedor.
ENV APP_UPLOAD_DIR=/app/uploads

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
