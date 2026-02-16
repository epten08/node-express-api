# Express API Starter

A production-ready TypeScript Express API starter with Prisma ORM, PostgreSQL, and Docker support. Features a clean layered architecture with built-in validation, error handling, and security best practices.

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL 16
- **ORM:** Prisma 7.x
- **Validation:** Zod
- **Security:** Helmet, CORS, bcrypt, JWT

## Quick Start

### Using Docker (Recommended)

```bash
# Start dev environment with PostgreSQL
npm run docker:dev

# Stop containers
npm run docker:dev:down
```

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `CORS_ORIGIN` | Allowed origins (comma-separated or `*`) | `*` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | - |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `30d` |

## API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |

### Users (`/api/v1/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List users (paginated) |
| POST | `/` | Create user |
| GET | `/:id` | Get user by ID |
| PATCH | `/:id` | Update user |
| DELETE | `/:id` | Delete user |

### Posts (`/api/v1/posts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List posts (paginated) |
| POST | `/` | Create post |
| GET | `/:id` | Get post by ID |
| PATCH | `/:id` | Update post |
| DELETE | `/:id` | Delete post |

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term (filters by relevant fields)

### Response Format

All responses follow a consistent structure:

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## Project Structure

```
src/
├── config/          # Configuration & database setup
├── controllers/     # HTTP request handlers
├── middleware/      # Validation & error handling
├── routes/          # API route definitions
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
└── validators/      # Zod validation schemas
```

**Request Flow:** Routes → Middleware → Controllers → Services → Prisma → Database

## Available Scripts

```bash
# Development
npm run dev              # Start with hot reload
npm run build            # Compile TypeScript
npm start                # Run production build

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio

# Docker
npm run docker:dev       # Start dev containers
npm run docker:dev:down  # Stop dev containers

# Linting
npm run lint             # Check for issues
npm run lint:fix         # Fix issues
```

## CI/CD (GitHub Actions + AWS ECR + VPS)

This repo includes `.github/workflows/node-api-cicd.yml`.

- CI: installs dependencies and runs `npm run build`
- CD: builds Docker image, pushes to AWS ECR, then deploys on VPS over SSH

Deployment files are in `deploy/`:
- `deploy/docker-compose.vps.yml`
- `deploy/.env.vps.example`
- `deploy/README.md` (first-time setup and required GitHub secrets)

Runtime environment variables are injected from GitHub Secret `APP_ENV_B64` during deployment.

## Adding a New Resource

1. **Define the model** in `prisma/schema.prisma`
2. **Generate client:** `npm run db:generate`
3. **Create validator:** `src/validators/{resource}.validator.ts`
4. **Create service:** `src/services/{resource}.service.ts`
5. **Create controller:** `src/controllers/{resource}.controller.ts`
6. **Create routes:** `src/routes/{resource}.routes.ts`
7. **Mount routes** in `src/routes/index.ts`

## Architecture Patterns

- **Layered Architecture** - Clear separation of concerns
- **Validation Middleware** - Zod schemas validate all inputs
- **Centralized Error Handling** - AppError class with global handler
- **Type Safety** - Full TypeScript with strict mode
- **Graceful Shutdown** - Proper cleanup on SIGTERM/SIGINT

## License

MIT
