echo "========================================="
echo "Haulage Management System - Test Suite"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if containers are running
if ! docker compose ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Containers are not running. Starting them...${NC}"
    docker compose up -d
    sleep 5
fi

echo -e "${GREEN}✅ Docker containers are running${NC}"
echo ""

# Install pytest in container if not already installed
echo "Installing pytest in container..."
docker compose exec -T api pip install pytest pytest-cov pytest-xdist -q

echo ""
echo "========================================="
echo "Running Tests..."
echo "========================================="
echo ""

# Run all tests with coverage
docker compose exec -T api python -m pytest app/tests/ \
    -v \
    --tb=short \
    --cov=app \
    --cov-report=term-missing \
    --cov-report=html

TEST_EXIT_CODE=$?

echo ""
echo "========================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed. Check the output above.${NC}"
fi
echo "========================================="

# Show test coverage summary
echo ""
echo "📊 Test coverage report generated in htmlcov/index.html"
echo ""

exit $TEST_EXIT_CODE
