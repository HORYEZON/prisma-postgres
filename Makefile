COMPOSE_BASE = docker/docker-compose.yml

# Development
dev:
	docker compose -f ${COMPOSE_BASE} up

dev-build:
	docker compose -f ${COMPOSE_BASE} up --build -d

# Testing
test:
	docker compose -f ${COMPOSE_BASE} -f docker/docker-compose.test.yml up

test-build:
	docker compose -f ${COMPOSE_BASE} -f docker/docker-compose.test.yml up --build -d

# Production
prod:
	docker compose -f ${COMPOSE_BASE} -f docker/docker-compose.prod.yml up

prod-build:
	docker compose -f ${COMPOSE_BASE} -f docker/docker-compose.prod.yml up --build -d

# Utility
down:
	docker compose down

logs:
	docker compose logs -f

validate:
	docker compose -f ${COMPOSE_BASE} -f docker/docker-compose.dev.yml config

clean:
	docker system prune -f
