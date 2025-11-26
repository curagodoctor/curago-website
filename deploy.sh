#!/bin/bash

# CuraGo VPS Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "======================================"
echo "   CuraGo Deployment Script v1.0"
echo "======================================"
echo ""

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root or with sudo"
   exit 1
fi

print_info "Starting deployment process..."
echo ""

# Step 1: Check Docker installation
print_info "Checking Docker installation..."
if command_exists docker; then
    print_success "Docker is already installed"
    docker --version
else
    print_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    print_success "Docker installed successfully"
fi
echo ""

# Step 2: Check Docker Compose
print_info "Checking Docker Compose..."
if docker compose version >/dev/null 2>&1; then
    print_success "Docker Compose is already installed"
    docker compose version
else
    print_info "Installing Docker Compose..."
    apt-get update
    apt-get install -y docker-compose-plugin
    print_success "Docker Compose installed successfully"
fi
echo ""

# Step 3: Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found in current directory"
    print_info "Please run this script from the project root directory"
    exit 1
fi

# Step 4: Create necessary directories
print_info "Creating required directories..."
mkdir -p letsencrypt
mkdir -p logs/traefik
chmod 600 letsencrypt
print_success "Directories created"
echo ""

# Step 5: Configure email for Let's Encrypt
print_info "Current email in docker-compose.yml:"
grep "acme.email" docker-compose.yml | head -1

echo ""
read -p "Do you want to change the email? (y/n): " change_email
if [[ $change_email == "y" || $change_email == "Y" ]]; then
    read -p "Enter your email for SSL certificates: " user_email
    sed -i "s/dubeyjatin0959@gmail.com/$user_email/g" docker-compose.yml
    print_success "Email updated to: $user_email"
fi
echo ""

# Step 6: Check DNS configuration
print_info "Checking DNS configuration..."
echo "Checking if curago.in points to this server..."

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
print_info "Server IP: $SERVER_IP"

# Check DNS (this might not work if dig is not installed)
if command_exists dig; then
    DNS_IP=$(dig +short curago.in | tail -n1)
    if [ "$DNS_IP" == "$SERVER_IP" ]; then
        print_success "DNS is correctly configured!"
    else
        print_error "DNS mismatch!"
        print_info "DNS points to: $DNS_IP"
        print_info "Server IP is: $SERVER_IP"
        echo ""
        read -p "Continue anyway? (y/n): " continue_anyway
        if [[ $continue_anyway != "y" && $continue_anyway != "Y" ]]; then
            print_error "Deployment cancelled"
            exit 1
        fi
    fi
else
    print_info "dig not available, skipping DNS check"
    print_info "Make sure curago.in points to: $SERVER_IP"
fi
echo ""

# Step 7: Configure firewall
print_info "Configuring firewall (UFW)..."
if command_exists ufw; then
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # Enable UFW if not already enabled
    if ! ufw status | grep -q "Status: active"; then
        print_info "Enabling UFW..."
        ufw --force enable
    fi
    
    print_success "Firewall configured"
    ufw status
else
    print_info "UFW not installed, skipping firewall configuration"
fi
echo ""

# Step 8: Stop any existing containers
print_info "Stopping existing containers (if any)..."
docker compose down 2>/dev/null || true
print_success "Cleaned up existing containers"
echo ""

# Step 9: Build the application
print_info "Building the application..."
print_info "This may take a few minutes on first run..."
docker compose build --no-cache

if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed!"
    exit 1
fi
echo ""

# Step 10: Start the services
print_info "Starting services..."
docker compose up -d

if [ $? -eq 0 ]; then
    print_success "Services started successfully"
else
    print_error "Failed to start services!"
    exit 1
fi
echo ""

# Step 11: Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 10

# Check service status
docker compose ps

echo ""
print_info "Waiting for SSL certificate (this may take up to 60 seconds)..."
sleep 30

# Step 12: Test the deployment
print_info "Testing deployment..."
echo ""

# Test HTTP (should redirect to HTTPS)
print_info "Testing HTTP -> HTTPS redirect..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L http://curago.in 2>/dev/null || echo "000")
if [[ $HTTP_CODE == "200" || $HTTP_CODE == "301" || $HTTP_CODE == "302" ]]; then
    print_success "HTTP redirect working (status: $HTTP_CODE)"
else
    print_error "HTTP test failed (status: $HTTP_CODE)"
fi

# Test HTTPS
print_info "Testing HTTPS..."
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://curago.in 2>/dev/null || echo "000")
if [ "$HTTPS_CODE" == "200" ]; then
    print_success "HTTPS working (status: $HTTPS_CODE)"
else
    print_error "HTTPS test failed (status: $HTTPS_CODE)"
    print_info "SSL certificate might still be provisioning. Check logs with: docker compose logs -f reverse-proxy"
fi

echo ""
echo "======================================"
echo "   Deployment Complete!"
echo "======================================"
echo ""
print_success "Your website should be accessible at:"
echo "  → https://curago.in"
echo "  → https://www.curago.in"
echo ""
print_info "Useful commands:"
echo "  View logs:     docker compose logs -f"
echo "  Restart:       docker compose restart"
echo "  Stop:          docker compose down"
echo "  Rebuild:       docker compose up -d --build"
echo ""
print_info "Next steps:"
echo "  1. Visit https://curago.in in your browser"
echo "  2. Check browser console for tracking debug output"
echo "  3. Test form submissions"
echo "  4. Monitor logs: docker compose logs -f website"
echo ""
print_info "If you encounter issues:"
echo "  - Check logs: docker compose logs -f"
echo "  - Check DNS: dig curago.in"
echo "  - Refer to VPS_DEPLOYMENT_GUIDE.md"
echo ""

# Show container status
print_info "Current container status:"
docker compose ps
echo ""

print_success "All done! 🎉"
