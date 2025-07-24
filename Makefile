COMPOSE_BASE = docker/docker-compose.yml

# Development
dev:
	docker compose --env-file .env -f ${COMPOSE_BASE} up

dev-build:
	docker compose --env-file .env -f ${COMPOSE_BASE} up --build -d

# Testing
test:
	docker compose --env-file .env.test -f ${COMPOSE_BASE} -f docker/docker-compose.test.yml up

test-build:
	docker compose --env-file .env.test -f ${COMPOSE_BASE} -f docker/docker-compose.test.yml up --build -d

# Production
prod:
	docker compose --env-file .env.prod -f ${COMPOSE_BASE} -f docker/docker-compose.prod.yml up

prod-build:
	docker compose --env-file .env.prod -f ${COMPOSE_BASE} -f docker/docker-compose.prod.yml up --build -d

# Utility
down:
	docker compose down

logs:
	docker compose logs -f

validate:
	docker compose --env-file .env -f ${COMPOSE_BASE} config

clean:
	docker system prune -f
