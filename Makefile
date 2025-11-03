.DEFAULT_GOAL := help

VERSION := $(shell git describe --tags 2>/dev/null || echo "dev")
GIT_COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_DATE := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")

DOCKER_COMPOSE_FILE := "./docker-compose.yml"

.PHONY: help
help: ## Show this help
	@echo "Aether Task Management System - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2}'

.PHONY: install
install: install-backend install-frontend ## Install all dependencies

.PHONY: install-backend
install-backend: ## Install backend dependencies
	@echo "Installing backend dependencies..."
	@cd backend && npm install

.PHONY: install-frontend
install-frontend: ## Install frontend dependencies
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install

.PHONY: build-backend
build-backend: ## Build backend TypeScript
	@echo "Building backend..."
	@cd backend && npm run build

.PHONY: build-frontend
build-frontend: ## Build frontend
	@echo "Building frontend..."
	@cd frontend && npm run build

.PHONY: build
build: build-backend build-frontend ## Build backend and frontend

.PHONY: dev-backend
dev-backend: ## Run backend in development mode
	@cd backend && npm run dev

.PHONY: dev-frontend
dev-frontend: ## Run frontend in development mode
	@cd frontend && npm run dev

.PHONY: dev
dev: ## Run both backend and frontend in development (requires two terminals)
	@echo "Run 'make dev-backend' in one terminal and 'make dev-frontend' in another"

.PHONY: start-backend
start-backend: build-backend ## Start backend production server
	@cd backend && npm start

.PHONY: start-frontend
start-frontend: build-frontend ## Start frontend production server
	@cd frontend && npm run preview

.PHONY: migrate
migrate: ## Run database migrations (runs in Docker)
	@docker compose -f $(DOCKER_COMPOSE_FILE) exec backend npm run migrate

.PHONY: seed
seed: ## Seed database with test data (runs in Docker)
	@docker compose -f $(DOCKER_COMPOSE_FILE) exec backend npm run seed

.PHONY: test-backend
test-backend: ## Run backend tests
	@echo "Running backend tests..."
	@cd backend && npm test

.PHONY: test-frontend
test-frontend: ## Run frontend tests
	@echo "Running frontend tests..."
	@cd frontend && npm test

.PHONY: test
test: test-backend test-frontend ## Run all tests

.PHONY: lint-backend
lint-backend: ## Lint backend code
	@echo "Linting backend..."
	@cd backend && npm run lint

.PHONY: lint-frontend
lint-frontend: ## Lint frontend code
	@echo "Linting frontend..."
	@cd frontend && npm run lint

.PHONY: lint
lint: lint-backend lint-frontend ## Lint all code

.PHONY: format-backend
format-backend: ## Format backend code
	@echo "Formatting backend..."
	@cd backend && npm run format

.PHONY: format-frontend
format-frontend: ## Format frontend code
	@echo "Formatting frontend..."
	@cd frontend && npm run format

.PHONY: format
format: format-backend format-frontend ## Format all code

.PHONY: check
check: lint test ## Run all quality checks

.PHONY: clean-backend
clean-backend: ## Clean backend build artifacts
	@echo "Cleaning backend..."
	@rm -rf backend/dist/
	@rm -rf backend/node_modules/
	@rm -rf backend/logs/

.PHONY: clean-frontend
clean-frontend: ## Clean frontend build artifacts
	@echo "Cleaning frontend..."
	@rm -rf frontend/dist/
	@rm -rf frontend/node_modules/

.PHONY: clean
clean: clean-backend clean-frontend ## Clean all build artifacts

# Production build commands (use deployments/docker-compose.yml)
.PHONY: prod-build
prod-build: ## Build production Docker images
	@echo "Building production images..."
	@cd deployments && docker compose build

.PHONY: prod-up
prod-up: ## Start production containers
	@cd deployments && docker compose up -d

.PHONY: prod-down
prod-down: ## Stop production containers
	@cd deployments && docker compose down

.PHONY: prod-logs
prod-logs: ## Show production logs
	@cd deployments && docker compose logs -f

.PHONY: prod-rebuild
prod-rebuild: prod-down prod-build prod-up ## Rebuild and restart production

.PHONY: docker-up
docker-up: ## Start all services with docker-compose
	@docker compose -f $(DOCKER_COMPOSE_FILE) up -d

.PHONY: docker-down
docker-down: ## Stop all services
	@docker compose -f $(DOCKER_COMPOSE_FILE) down

.PHONY: docker-restart
docker-restart: ## Restart all services
	@docker compose -f $(DOCKER_COMPOSE_FILE) restart

.PHONY: docker-logs
docker-logs: ## Show docker-compose logs
	@docker compose -f $(DOCKER_COMPOSE_FILE) logs -f

.PHONY: docker-logs-backend
docker-logs-backend: ## Show backend logs
	@docker compose -f $(DOCKER_COMPOSE_FILE) logs -f backend

.PHONY: docker-logs-frontend
docker-logs-frontend: ## Show frontend logs
	@docker compose -f $(DOCKER_COMPOSE_FILE) logs -f frontend

.PHONY: docker-clean
docker-clean: ## Stop services and remove volumes
	@docker compose -f $(DOCKER_COMPOSE_FILE) down -v

.PHONY: docker-rebuild
docker-rebuild: docker-down docker-up ## Restart dev containers (auto-installs deps and hot-reloads)

.PHONY: docker-shell-backend
docker-shell-backend: ## Open shell in backend container
	@docker compose -f $(DOCKER_COMPOSE_FILE) exec backend sh

.PHONY: docker-shell-frontend
docker-shell-frontend: ## Open shell in frontend container
	@docker compose -f $(DOCKER_COMPOSE_FILE) exec frontend sh

.PHONY: docker-ps
docker-ps: ## Show running containers
	@docker compose -f $(DOCKER_COMPOSE_FILE) ps

.PHONY: setup-local
setup-local: install migrate seed ## Setup local development environment

.PHONY: setup-docker
setup-docker: docker-build docker-up ## Setup Docker environment

.PHONY: clean-all
clean-all: ## Remove all build artifacts, temporary files, and Docker resources
	@docker compose -f $(DOCKER_COMPOSE_FILE) down -v 2>/dev/null || true
	@docker rmi aether-backend:latest aether-backend:dev 2>/dev/null || true
	@docker rmi aether-frontend:latest aether-frontend:dev 2>/dev/null || true
	@sudo rm -rf backend/dist/ backend/node_modules/ backend/logs/ backend/uploads/ || true
	@sudo rm -rf frontend/dist/ frontend/node_modules/ || true
	@docker system prune -f
