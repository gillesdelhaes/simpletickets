.PHONY: dev dev-frontend build migrate shell-api shell-db logs prod-build prod-up prod-down

# ── Development ───────────────────────────────────────────────────────────────

dev:
	@echo "Starting API + DB with hot reload..."
	@echo "Run 'make dev-frontend' in another terminal for the React dev server."
	docker compose up api db

dev-frontend:
	cd frontend && npm run dev

build:
	docker compose build

# ── Database ──────────────────────────────────────────────────────────────────

migrate:
	docker compose run --rm api alembic upgrade head

migrate-down:
	docker compose run --rm api alembic downgrade -1

migrate-new:
	@read -p "Migration name: " name; \
	docker compose run --rm api alembic revision --autogenerate -m "$$name"

# ── Shells ────────────────────────────────────────────────────────────────────

shell-api:
	docker compose run --rm api bash

shell-db:
	docker compose exec db psql -U postgres simplytickets

# ── Logs ──────────────────────────────────────────────────────────────────────

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

# ── Production ────────────────────────────────────────────────────────────────

prod-build:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml build

prod-up:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down
