# Getting Started

Quick start guide for setting up NegotiationMaster locally.

## Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 13.0
- **Git** >= 2.20
- **npm** >= 8.0

## Quick Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/negotiation-master.git
cd negotiation-master
```

### 2. Environment Setup

Copy environment configuration:

```bash
cp .env.example .env
```

Update `.env` with your settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=negotiation_master
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DATABASE_URL=postgresql://your_db_user:your_db_password@localhost:5432/negotiation_master

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# AI API Configuration
OPENAI_API_KEY=your-openai-api-key
```

### 3. Database Setup

Create PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE negotiation_master;
CREATE USER your_db_user WITH PASSWORD 'your_db_password';
GRANT ALL PRIVILEGES ON DATABASE negotiation_master TO your_db_user;
\q
```

### 4. Backend Setup

```bash
cd backend
npm install
npm run migrate
npm run seed
```

### 5. Frontend Setup

```bash
cd frontend
npm install
```

### 6. Start Development Servers

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

## Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## Test Account

Create a test account or use the seeded data:

```bash
# Register via API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Verify Installation

### Backend Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "NegotiationMaster API is running",
  "timestamp": "2025-01-29T10:00:00.000Z",
  "environment": "development"
}
```

### Frontend Access

1. Open http://localhost:3000
2. You should see the NegotiationMaster landing page
3. Click "Sign In" and create an account
4. Access the dashboard to see scenarios

### Database Verification

```bash
cd backend
npx knex migrate:status
```

Should show all migrations as completed.

## Common Issues

### Database Connection Issues

**Problem**: `password authentication failed for user "postgres"`

**Solution**: 
1. Verify PostgreSQL is running: `brew services start postgresql` (macOS)
2. Check credentials in `.env` file
3. Ensure database and user exist

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find process using port
lsof -ti:5000
# Kill process
kill -9 <PID>
```

### Node Version Issues

**Problem**: `error This package requires Node.js >=18.0.0`

**Solution**: Use Node Version Manager (nvm)
```bash
nvm install 18
nvm use 18
```

### Missing Dependencies

**Problem**: Module not found errors

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Development Commands

### Backend

```bash
# Start development server
npm run dev

# Run tests
npm test
npm run test:watch

# Database operations
npm run migrate
npm run migrate:rollback
npm run seed

# Code quality
npm run lint
npm run lint:fix
```

### Frontend

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Code quality
npm run lint
npm run lint:fix

# Bundle analysis
npm run analyze
```

## Next Steps

1. **Explore Features**: Try creating negotiations and exploring scenarios
2. **Read Documentation**: Check out [API Documentation](../api/endpoints.md)
3. **Development Workflow**: Review [CONTRIBUTING.md](../../CONTRIBUTING.md)
4. **Architecture**: Understand the [System Architecture](../architecture/overview.md)
5. **Database Schema**: Learn about [Database Design](../database/schema.md)

## Getting Help

- **Documentation**: Check the [docs](../README.md) directory
- **Issues**: Search existing [GitHub issues](../../issues)
- **Discussions**: Join development discussions
- **Support**: Create issue with `help wanted` label

---

*Need help? Check the [troubleshooting guide](./troubleshooting.md) or create an issue.*