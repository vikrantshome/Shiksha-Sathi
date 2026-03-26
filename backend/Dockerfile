FROM eclipse-temurin:23-jdk-alpine AS builder

WORKDIR /app
COPY . .
RUN ./gradlew build -x test

FROM eclipse-temurin:23-jre-alpine
WORKDIR /app
COPY --from=builder /app/api/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
