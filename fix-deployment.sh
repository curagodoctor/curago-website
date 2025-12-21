#!/bin/bash
# Fix deployment script for payment verification 502 error
# Run this on your VPS at /opt/curago-website

set -e

echo "🔧 Fixing payment verification deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create .env file with Razorpay credentials"
    exit 1
fi

# Check if Razorpay credentials are set
if ! grep -q "RAZORPAY_KEY_ID=rzp_" .env; then
    echo -e "${RED}❌ Error: RAZORPAY_KEY_ID not set in .env${NC}"
    echo "Please add your Razorpay credentials to .env"
    exit 1
fi

echo -e "${GREEN}✓${NC} .env file found with Razorpay credentials"

# Stop all containers
echo -e "\n${YELLOW}1. Stopping containers...${NC}"
docker compose down

# Remove old images to force rebuild
echo -e "\n${YELLOW}2. Removing old images...${NC}"
docker compose rm -f

# Rebuild without cache
echo -e "\n${YELLOW}3. Rebuilding containers (this may take a few minutes)...${NC}"
docker compose build --no-cache

# Start containers
echo -e "\n${YELLOW}4. Starting containers...${NC}"
docker compose up -d

# Wait for containers to be healthy
echo -e "\n${YELLOW}5. Waiting for containers to be ready...${NC}"
sleep 10

# Check container status
echo -e "\n${YELLOW}6. Checking container status...${NC}"
docker compose ps

# Test proxy-server health
echo -e "\n${YELLOW}7. Testing proxy-server health...${NC}"
if docker exec curago-proxy wget -q -O- http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Proxy server is healthy"
else
    echo -e "${RED}❌${NC} Proxy server health check failed"
    echo "Showing proxy-server logs:"
    docker compose logs --tail=50 proxy-server
    exit 1
fi

# Test if website can reach proxy-server
echo -e "\n${YELLOW}8. Testing website → proxy-server connectivity...${NC}"
if docker exec curago-website wget -q -O- http://proxy-server:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Website can reach proxy-server"
else
    echo -e "${RED}❌${NC} Website cannot reach proxy-server"
    echo "This might be a network issue"
    exit 1
fi

# Show proxy-server environment variables (without secrets)
echo -e "\n${YELLOW}9. Verifying environment variables...${NC}"
if docker exec curago-proxy printenv | grep -q "RAZORPAY_KEY_ID"; then
    echo -e "${GREEN}✓${NC} RAZORPAY_KEY_ID is set"
else
    echo -e "${RED}❌${NC} RAZORPAY_KEY_ID is not set in container"
    exit 1
fi

if docker exec curago-proxy printenv | grep -q "RAZORPAY_KEY_SECRET"; then
    echo -e "${GREEN}✓${NC} RAZORPAY_KEY_SECRET is set"
else
    echo -e "${RED}❌${NC} RAZORPAY_KEY_SECRET is not set in container"
    exit 1
fi

echo -e "\n${GREEN}✅ Deployment fixed successfully!${NC}"
echo -e "\n📋 Next steps:"
echo "1. Test payment at: https://curago.in/calm"
echo "2. Monitor logs: docker compose logs -f proxy-server"
echo "3. Check payment verification in logs after completing a test payment"

echo -e "\n💡 Useful commands:"
echo "  View all logs:        docker compose logs -f"
echo "  View proxy logs:      docker compose logs -f proxy-server"
echo "  Restart proxy:        docker compose restart proxy-server"
echo "  Check health:         curl https://curago.in/api/health"
