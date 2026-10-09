# Workout Tracker
A workout tracking application built with Angular, Spring Boot and PostgreSQL.

## Requirements
- Docker Desktop (or Docker Engine with Compose)

## Getting started
1. Clone the repository.
2. Copy `.env.example` to `.env`.
3. Configure the PostgreSQL credentials in `.env`.
4. Build and start the application:
   ```bash
   docker compose up --build -d
   ```
5. Open http://localhost:4200


## Docker commands

### Start containers
```bash
docker compose up -d
```

### Stop containers
```bash
docker compose stop
```

### Stop and remove containers
```bash
docker compose down
```

### Rebuild after code changes
```bash
docker compose up --build -d
```

### View container status
```bash
docker compose ps
```

### View logs
```bash
docker compose logs -f
```

### Database persistence
PostgreSQL data is stored in a Docker named volume (`postgres_data`).
The data survives container restarts and `docker compose down`.
**Warning:** Running `docker compose down -v` also deletes the database volume and all data stored in it.

## Database backup and restore
Database backups are stored in the local `backups/` directory, which is excluded from Git.

### Export an existing PostgreSQL database
Requires PostgreSQL client tools (`pg_dump`) installed locally.
```bash
mkdir backups
pg_dump -h localhost -p 5432 -U YOUR_USER -d YOUR_DATABASE -Fc -f backups/workout-tracker-backup.dump
```
Replace `YOUR_USER` and `YOUR_DATABASE` with local PostgreSQL credentials.

### Restore into Docker
**Warning**: docker compose down -v deletes all named volumes belonging to this Compose project, including the PostgreSQL database. Only use this procedure when replacing the Docker database is intentional.
```bash
docker compose down -v
docker compose up -d db
```
Copy the backup into the PostgreSQL container:
```bash
docker compose cp backups/workout-tracker-backup.dump db:/tmp/workout-tracker-backup.dump
```
Restore the database:
```bash
docker compose exec db pg_restore --exit-on-error --no-owner --no-acl -U YOUR_DOCKER_DB_USER -d YOUR_DOCKER_DB_NAME /tmp/workout-tracker-backup.dump
```
Replace the database username and name with the values from `.env`.
Start the application:

```bash
docker compose up -d
```
The backup restores the database schema and data, including the Flyway migration history.