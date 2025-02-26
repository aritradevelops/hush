# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_EXEC = docker exec -it
TS_NODE = ts-node -T
NODEMON = nodemon
NODE = node
TSC = tsc --build
RM = rm -fr

# Default target
.DEFAULT_GOAL := help

.PHONY: help dev prod prod-watch cli build clean docker docker-stop exec-cli db db-restart db-stop db-attach

help:
	@echo "Available commands:"
	@echo "  make dev           - Start development server with nodemon"
	@echo "  make prod          - Start production server"
	@echo "  make prod-watch    - Start production server with hot reload"
	@echo "  make cli           - Run CLI in development mode"
	@echo "  make build         - Build project"
	@echo "  make clean         - Clean the dist directory"
	@echo "  make docker        - Start docker-compose services"
	@echo "  make docker-stop   - Stop docker-compose services"
	@echo "  make exec-cli      - Run CLI inside Docker"
	@echo "  make db            - Start database container"
	@echo "  make db-restart    - Restart database container"
	@echo "  make db-stop       - Stop database container"
	@echo "  make db-attach     - Attach to PostgreSQL in Docker"

# Development

dev:
	$(NODEMON) --files src/index.ts src/index.ts

prod:
	NODE_ENV=production $(NODE) dist/index.js

prod-watch:
	NODE_ENV=production $(NODEMON) --hot dist/index.js

cli:
	NODE_ENV=development $(TS_NODE) cli/index.ts

build:
	$(TSC)

clean:
	$(RM) dist

# Docker

docker:
	$(DOCKER_COMPOSE) up

docker-stop:
	$(DOCKER_COMPOSE) down

exec-cli:
	$(DOCKER_EXEC) barebone-server npm run cli

db:
	cd db && $(DOCKER_COMPOSE) up -d

db-restart:
	cd db && $(DOCKER_COMPOSE) up --force-recreate

db-stop:
	cd db && $(DOCKER_COMPOSE) down

db-attach:
	$(DOCKER_EXEC) chat-app-postgres psql -U postgres -d chat-app
