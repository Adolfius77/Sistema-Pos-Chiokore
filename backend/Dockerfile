FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

RUN groupadd --system spring \
    && useradd --system --gid spring spring \
    && mkdir -p /app/uploads \
    && chown spring:spring /app/uploads

COPY --from=builder /app/target/*.jar /app/app.jar

USER spring
ENV APP_UPLOAD_DIR=/app/uploads
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
