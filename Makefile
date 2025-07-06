dev:
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up

prod:
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up

dev-build:
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up --build -d

prod-build:
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

validate:
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml config

clean:
	docker system prune -f