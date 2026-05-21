.PHONY: dev test test-backend test-frontend test-integration lint-backend lint-frontend clean

dev:
	docker compose -f infra/docker/docker-compose.yml up --build

test: test-backend test-frontend

test-backend:
	cd backend && python -m pytest -v --cov=src --cov-config=.coveragerc --cov-fail-under=80

test-frontend:
	cd frontend && npm test

test-integration:
	bash infra/docker/tests/run-stack-health.sh

lint-backend:
	cd backend && ruff check src/

lint-frontend:
	cd frontend && npm run lint

clean:
	docker compose -f infra/docker/docker-compose.yml down -v
