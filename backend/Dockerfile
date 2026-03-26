FROM eclipse-temurin:23-jdk-alpine AS builder

WORKDIR /app
COPY . .
RUN ./gradlew :api:bootJar -x test

FROM eclipse-temurin:23-jre-alpine
WORKDIR /app
COPY --from=builder /app/api/build/libs/*-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
