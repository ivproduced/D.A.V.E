#!/bin/bash

# D.A.V.E Setup and Verification Script
# This script checks prerequisites and helps set up the application

set -e  # Exit on error

echo "=================================="
echo "🚀 D.A.V.E Setup & Verification"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check functions
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        if [ "$2" != "" ]; then
            version=$($2)
            echo -e "  ${BLUE}Version: $version${NC}"
        fi
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        return 1
    fi
}

echo "📋 Checking Prerequisites..."
echo ""

# Check Python
if check_command python3 "python3 --version"; then
    PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    REQUIRED_VERSION="3.11"
    if (( $(echo "$PYTHON_VERSION >= $REQUIRED_VERSION" | bc -l) )); then
        echo -e "  ${GREEN}✓ Python version is sufficient ($PYTHON_VERSION >= $REQUIRED_VERSION)${NC}"
    else
        echo -e "  ${RED}✗ Python version too old ($PYTHON_VERSION < $REQUIRED_VERSION)${NC}"
        echo -e "  ${YELLOW}Please install Python 3.11 or higher${NC}"
        exit 1
    fi
else
    echo -e "${RED}Python 3 is required but not found${NC}"
    echo "Install from: https://www.python.org/downloads/"
    exit 1
fi

echo ""

# Check Node.js
if check_command node "node --version"; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "  ${GREEN}✓ Node.js version is sufficient (v$NODE_VERSION >= v18)${NC}"
    else
        echo -e "  ${RED}✗ Node.js version too old (v$NODE_VERSION < v18)${NC}"
        echo -e "  ${YELLOW}Please install Node.js 18 or higher${NC}"
        exit 1
    fi
else
    echo -e "${RED}Node.js is required but not found${NC}"
    echo "Install from: https://nodejs.org/"
    exit 1
fi

echo ""

# Check npm
check_command npm "npm --version" || exit 1

echo ""

# Check pip
check_command pip3 "pip3 --version" || {
    echo -e "${YELLOW}pip3 not found, trying pip...${NC}"
    check_command pip "pip --version" || exit 1
}

echo ""

# Optional tools
echo "🔧 Checking Optional Tools..."
echo ""

check_command docker "docker --version" || echo -e "  ${YELLOW}Docker is optional but recommended${NC}"
check_command docker-compose "docker-compose --version" || echo -e "  ${YELLOW}Docker Compose is optional${NC}"

echo ""
echo "=================================="
echo "📦 Setting Up Backend..."
echo "=================================="
echo ""

cd backend

# Check if venv exists
if [ -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment already exists${NC}"
else
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate venv
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Check .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    
    # Check if API key is set
    if grep -q "GOOGLE_AI_API_KEY=your_google_ai_api_key_here" .env; then
        echo -e "${YELLOW}⚠ Warning: You need to add your Google AI API key to .env${NC}"
        echo -e "  Get your key from: ${BLUE}https://makersuite.google.com/app/apikey${NC}"
    else
        echo -e "${GREEN}✓ Google AI API key appears to be set${NC}"
    fi
else
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠ IMPORTANT: Edit backend/.env and add your GOOGLE_AI_API_KEY${NC}"
    echo -e "  Get your key from: ${BLUE}https://makersuite.google.com/app/apikey${NC}"
fi

cd ..

echo ""
echo "=================================="
echo "⚛️  Setting Up Frontend..."
echo "=================================="
echo ""

cd frontend

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules already exists${NC}"
    echo "Run 'npm install' to update dependencies if needed"
else
    echo "Installing Node.js dependencies..."
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
fi

# Check .env.local file
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local file exists${NC}"
else
    echo -e "${YELLOW}Creating .env.local file from template...${NC}"
    cp .env.local.example .env.local
    echo -e "${GREEN}✓ .env.local created${NC}"
fi

cd ..

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Add your Google AI API key:"
echo -e "   ${BLUE}Edit backend/.env and set GOOGLE_AI_API_KEY${NC}"
echo -e "   ${BLUE}Get key from: https://makersuite.google.com/app/apikey${NC}"
echo ""
echo "2. Start the backend (Terminal 1):"
echo -e "   ${BLUE}cd backend${NC}"
echo -e "   ${BLUE}source venv/bin/activate${NC}"
echo -e "   ${BLUE}uvicorn app.main:app --reload${NC}"
echo ""
echo "3. Start the frontend (Terminal 2):"
echo -e "   ${BLUE}cd frontend${NC}"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "4. Open your browser:"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICKSTART.md"
echo "   - Testing: TESTING.md"
echo "   - API Docs: API.md"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
echo ""
