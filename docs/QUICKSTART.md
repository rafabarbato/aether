# Aether - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ running
- Redis 7+ running
- Git installed

## Option 1: Local Development (Without Docker)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Aether
make install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and configure database credentials.

### 3. Setup Database

```bash
createdb aether_task_management
make migrate
make seed
```

### 4. Start Development Servers

**Terminal 1 (Backend)**:
```bash
make dev-backend
```

**Terminal 2 (Frontend)**:
```bash
make dev-frontend
```

### 5. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1
- API Health: http://localhost:3000/api/v1/health

### 6. Test Credentials

- Admin: `admin@aether.com` / `admin123`
- Manager: `manager@aether.com` / `manager123`
- Member: `user@aether.com` / `user123`

---

## Option 2: Docker Development

### 1. Clone Repository

```bash
git clone <repository-url>
cd Aether
```

### 2. Build and Start

```bash
make docker-build
make docker-up
```

### 3. Run Migrations and Seed

```bash
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```

### 4. Access Application

- Frontend: http://localhost
- Backend API: http://localhost/api/v1
- API Health: http://localhost/api/v1/health

### 5. View Logs

```bash
make docker-logs
```

or for specific service:

```bash
make docker-logs-backend
make docker-logs-frontend
```

### 6. Stop Services

```bash
make docker-down
```

---

## Useful Make Commands

### Development

```bash
make install              # Install all dependencies
make dev-backend         # Run backend in dev mode
make dev-frontend        # Run frontend in dev mode
make migrate             # Run database migrations
make seed                # Seed test data
```

### Testing

```bash
make test                # Run all tests
make test-backend        # Run backend tests
make test-frontend       # Run frontend tests
make lint                # Lint all code
make format              # Format all code
```

### Building

```bash
make build               # Build backend and frontend
make build-backend       # Build backend only
make build-frontend      # Build frontend only
```

### Docker

```bash
make docker-build        # Build Docker images
make docker-up           # Start containers
make docker-down         # Stop containers
make docker-restart      # Restart containers
make docker-logs         # Show all logs
make docker-clean        # Remove volumes and data
make docker-rebuild      # Rebuild and restart
```

### Cleanup

```bash
make clean               # Clean build artifacts
make clean-backend       # Clean backend artifacts
make clean-frontend      # Clean frontend artifacts
```

---

## Troubleshooting

### Port Already in Use

If ports 3000 or 5173 are in use:

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database Connection Error

Ensure PostgreSQL is running:

```bash
sudo service postgresql status
sudo service postgresql start
```

### Redis Connection Error

Ensure Redis is running:

```bash
sudo service redis-server status
sudo service redis-server start
```

### Docker Containers Not Starting

Check Docker service:

```bash
sudo service docker status
sudo service docker start
```

View container logs:

```bash
docker compose logs
```

### Permission Errors

Fix file permissions:

```bash
sudo chown -R $USER:$USER .
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit code, run tests, and ensure everything works.

### 3. Run Quality Checks

```bash
make check
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: your feature description"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

---

## API Testing

### Using cURL

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get tasks (with token)
curl http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

Import the API documentation from `docs/API.md` or manually test endpoints.

---

## Environment Variables Reference

See `.env.example` for all available configuration options.

**Critical variables**:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database connection
- `REDIS_HOST`, `REDIS_PORT`: Redis connection
- `JWT_SECRET`, `JWT_REFRESH_SECRET`: Authentication secrets (change in production)
- `CORS_ORIGIN`: Frontend URL for CORS
- `PORT`: Backend server port

---

## Next Steps

- Read `README.md` for comprehensive documentation
- Check `docs/ARCHITECTURE.md` for system architecture
- Review `docs/API.md` for API documentation
- Start building features and contributing
