# get maven image, set "build" as stage
FROM maven:3.9-eclipse-temurin-21 AS build

# create /app if necessary and set it as working directory
WORKDIR /app

# copy pom.xml to current dir /app
COPY pom.xml .

# copy src folder to current dir /app/src
COPY src ./src

# compile and package the application into a JAR without running tests
RUN mvn package -DskipTests

# get small java docker image and set "runtime" as stage
FROM eclipse-temurin:21-jre AS runtime

# create /app if necessary and set it as working directory
WORKDIR /app

# copy the generated JAR from the build stage into /app/app.jar
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# run java -jar app.jar
ENTRYPOINT [ "java", "-jar", "app.jar" ]

