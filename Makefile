.PHONY: up down build deploy test reset help

# Docker commands
up:
	docker-compose up -d

down:
	docker-compose down -v

build:
	docker-compose build

reset: down up

# Hardhat commands (run inside container or locally)
deploy:
	npx hardhat run scripts/deploy.cjs --network localhost

test:
	npx hardhat test

# Logs
logs:
	docker-compose logs -f

# Help
help:
	@echo "Available commands:"
	@echo "  make up       - Start all services (detached)"
	@echo "  make down     - Stop all services and remove volumes"
	@echo "  make build    - Build docker images"
	@echo "  make deploy   - Deploy smart contracts to localhost"
	@echo "  make test     - Run smart contract tests"
	@echo "  make reset    - Reset the entire environment"
	@echo "  make logs     - View persistent logs"
