# CuraGo Docker Management Makefile

.PHONY: help build up down restart logs status clean deploy update backup restore test

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)CuraGo Docker Management$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker compose build --no-cache

up: ## Start all services
	@echo "$(BLUE)Starting services...$(NC)"
	docker compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@make status

down: ## Stop all services
	@echo "$(BLUE)Stopping services...$(NC)"
	docker compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(BLUE)Restarting services...$(NC)"
	docker compose restart
	@echo "$(GREEN)✓ Services restarted$(NC)"
	@make status

rebuild: ## Rebuild and restart all services
	@echo "$(BLUE)Rebuilding and restarting...$(NC)"
	docker compose down
	docker compose build --no-cache
	docker compose up -d
	@echo "$(GREEN)✓ Rebuild complete$(NC)"
	@make status

logs: ## View logs for all services (use Ctrl+C to exit)
	docker compose logs -f

logs-website: ## View logs for website only
	docker compose logs -f website

logs-traefik: ## View logs for Traefik only
	docker compose logs -f reverse-proxy

status: ## Show status of all containers
	@echo "$(BLUE)Container Status:$(NC)"
	@docker compose ps
	@echo ""
	@echo "$(BLUE)Resource Usage:$(NC)"
	@docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || echo "Docker stats not available"

health: ## Check health of services
	@echo "$(BLUE)Health Check:$(NC)"
	@docker inspect curago-website --format='{{.State.Health.Status}}' 2>/dev/null || echo "Website: N/A"
	@echo ""
	@echo "$(BLUE)Testing HTTP:$(NC)"
	@curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:80/health || echo "HTTP test failed"
	@echo ""
	@echo "$(BLUE)Testing HTTPS:$(NC)"
	@curl -s -o /dev/null -w "HTTPS Status: %{http_code}\n" https://curago.in 2>/dev/null || echo "HTTPS test failed (might be provisioning SSL)"

clean: ## Remove stopped containers and unused images
	@echo "$(BLUE)Cleaning up...$(NC)"
	docker compose down -v
	docker image prune -af
	docker volume prune -f
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

deploy: ## Full deployment (build + up)
	@echo "$(BLUE)Deploying CuraGo...$(NC)"
	@make build
	@make up
	@echo ""
	@echo "$(GREEN)✓ Deployment complete!$(NC)"
	@echo "Visit: https://curago.in"

update: ## Pull latest code and redeploy
	@echo "$(BLUE)Updating application...$(NC)"
	git pull
	@make rebuild
	@echo "$(GREEN)✓ Update complete$(NC)"

backup: ## Backup SSL certificates and logs
	@echo "$(BLUE)Creating backup...$(NC)"
	@mkdir -p backups
	tar -czf backups/curago-backup-$$(date +%Y%m%d-%H%M%S).tar.gz letsencrypt/ logs/ docker-compose.yml .env 2>/dev/null || tar -czf backups/curago-backup-$$(date +%Y%m%d-%H%M%S).tar.gz letsencrypt/ logs/ docker-compose.yml
	@echo "$(GREEN)✓ Backup created in backups/$(NC)"
	@ls -lh backups/ | tail -1

restore: ## Restore from latest backup
	@echo "$(BLUE)Restoring from latest backup...$(NC)"
	@LATEST=$$(ls -t backups/*.tar.gz | head -1); \
	if [ -z "$$LATEST" ]; then \
		echo "$(YELLOW)No backups found$(NC)"; \
		exit 1; \
	fi; \
	echo "Restoring from: $$LATEST"; \
	tar -xzf $$LATEST; \
	echo "$(GREEN)✓ Restore complete$(NC)"

test: ## Run deployment tests
	@echo "$(BLUE)Running tests...$(NC)"
	@echo ""
	@echo "$(BLUE)1. DNS Test:$(NC)"
	@dig +short curago.in || echo "dig not available"
	@echo ""
	@echo "$(BLUE)2. Container Status:$(NC)"
	@docker compose ps
	@echo ""
	@echo "$(BLUE)3. Health Check:$(NC)"
	@docker inspect curago-website --format='Website: {{.State.Health.Status}}' 2>/dev/null || echo "Website: N/A"
	@echo ""
	@echo "$(BLUE)4. HTTP Test:$(NC)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost/health || echo "Failed"
	@echo ""
	@echo "$(BLUE)5. SSL Certificate:$(NC)"
	@ls -lh letsencrypt/acme.json 2>/dev/null || echo "No SSL certificate yet"
	@echo ""
	@echo "$(GREEN)✓ Tests complete$(NC)"

shell-website: ## Open shell in website container
	docker compose exec website sh

shell-traefik: ## Open shell in Traefik container
	docker compose exec reverse-proxy sh

ssl-info: ## Show SSL certificate information
	@echo "$(BLUE)SSL Certificate Info:$(NC)"
	@if [ -f letsencrypt/acme.json ]; then \
		echo "Certificate file exists"; \
		ls -lh letsencrypt/acme.json; \
		echo ""; \
		echo "Certificate details:"; \
		echo | openssl s_client -servername curago.in -connect curago.in:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "Certificate not yet available"; \
	else \
		echo "No certificate file found"; \
	fi

ssl-renew: ## Force SSL certificate renewal
	@echo "$(BLUE)Forcing SSL certificate renewal...$(NC)"
	sudo rm -f letsencrypt/acme.json
	docker compose restart reverse-proxy
	@echo "$(GREEN)✓ Certificate renewal initiated$(NC)"
	@echo "Monitor with: make logs-traefik"

monitor: ## Monitor container resource usage (use Ctrl+C to exit)
	@echo "$(BLUE)Monitoring resources (Ctrl+C to exit)...$(NC)"
	docker stats

disk: ## Show disk usage
	@echo "$(BLUE)Disk Usage:$(NC)"
	@df -h | grep -E "Filesystem|/dev/root|/dev/sda|/dev/vda" || df -h
	@echo ""
	@echo "$(BLUE)Docker Disk Usage:$(NC)"
	@docker system df

firewall: ## Show firewall status
	@echo "$(BLUE)Firewall Status:$(NC)"
	@sudo ufw status verbose || echo "UFW not installed"

ports: ## Show which ports are in use
	@echo "$(BLUE)Ports in use:$(NC)"
	@sudo netstat -tulpn | grep -E ":80|:443|:22" || sudo ss -tulpn | grep -E ":80|:443|:22"

prod: ## Deploy using production configuration
	@echo "$(BLUE)Deploying with production config...$(NC)"
	docker compose -f docker-compose.prod.yml build --no-cache
	docker compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Production deployment complete$(NC)"

dev: ## Start in development mode
	@echo "$(BLUE)Starting in development mode...$(NC)"
	docker compose up

quick: ## Quick restart (no rebuild)
	@make down
	@make up

full-reset: ## Complete reset (WARNING: Deletes all data)
	@echo "$(YELLOW)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? (y/N): " confirm; \
	if [ "$$confirm" = "y" ]; then \
		make down; \
		sudo rm -rf letsencrypt/ logs/; \
		docker volume prune -af; \
		echo "$(GREEN)✓ Full reset complete$(NC)"; \
	else \
		echo "Cancelled"; \
	fi

check-updates: ## Check for available updates
	@echo "$(BLUE)Checking for updates...$(NC)"
	@git fetch
	@git status -uno
	@echo ""
	@echo "$(BLUE)To update, run:$(NC) make update"
