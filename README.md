# Project Management System

A modern, multi-tenant project management application built with Django, GraphQL, React, and TypeScript.

## Features

- **Multi-tenant Architecture**: Complete data isolation between organizations
- **GraphQL API**: Efficient, type-safe data fetching with GraphiQL playground
- **Modern Frontend**: React 18 with TypeScript and TailwindCSS
- **Real-time Development**: Hot module replacement for both backend and frontend
- **Containerized**: Docker Compose for easy setup and consistent environments
- **Type Safety**: Full TypeScript on frontend, Django ORM on backend

### Core Functionality

- Organization management with slug-based routing
- Project creation and tracking with status management (Active, Completed, On Hold)
- Task management with assignee tracking and status updates
- Comment system for task collaboration
- Project statistics (task counts, completion rates)
- Responsive, modern UI design

## Tech Stack

### Backend
- **Django 4.2+** - Python web framework
- **Graphene-Django 3.0+** - GraphQL integration
- **PostgreSQL 15+** - Database
- **pytest** - Testing framework

### Frontend
- **React 18.2+** - UI library
- **TypeScript 5.2+** - Type-safe JavaScript
- **Apollo Client 3.8+** - GraphQL client
- **TailwindCSS 3.4+** - Utility-first CSS
- **Vite 5.0+** - Build tool

### DevOps
- **Docker & Docker Compose** - Containerization
- **PostgreSQL** - Database server

## Prerequisites

Choose one of the following setups:

### Option 1: Docker (Recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker Compose)

### Option 2: Local Development
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

## Quick Start (Docker)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voice-ai-wrapper
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env if needed (default values work for local development)
   ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Run initial migrations** (in a new terminal)
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

5. **Create a superuser** (optional, for Django admin)
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - GraphQL API: http://localhost:8000/graphql
   - Django Admin: http://localhost:8000/admin

That's it! The application should now be running.

## Development Setup (Without Docker)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env to match your local PostgreSQL configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will be available at http://localhost:8000

### Frontend Setup

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

Frontend will be available at http://localhost:5173

## Project Structure

```
.
├── backend/                 # Django backend
│   ├── backend/            # Django project
│   │   ├── apps/
│   │   │   └── core/       # Main app (models, schema, etc.)
│   │   ├── settings.py     # Django settings
│   │   └── urls.py         # URL routing
│   ├── manage.py           # Django CLI
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── graphql/       # GraphQL queries/mutations
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Root component
│   ├── package.json       # Node dependencies
│   ├── vite.config.ts     # Vite configuration
│   └── Dockerfile
│
├── docker-compose.yml     # Docker orchestration
├── .env.example          # Environment template
└── README.md             # This file
```

## Common Commands

### Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild containers
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Django Commands

```bash
# Create migrations
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Django shell
docker-compose exec backend python manage.py shell

# Run tests
docker-compose exec backend pytest

# Run tests with coverage
docker-compose exec backend pytest --cov=backend
```

### Frontend Commands

```bash
# Install new package
docker-compose exec frontend npm install <package-name>

# Run linter
docker-compose exec frontend npm run lint

# Build for production
docker-compose exec frontend npm run build
```

## Running Tests

### Backend Tests

```bash
# With Docker
docker-compose exec backend pytest

# Without Docker (in backend directory with venv activated)
pytest

# With coverage
pytest --cov=backend --cov-report=html
```

### Frontend Tests

```bash
# With Docker
docker-compose exec frontend npm test

# Without Docker
cd frontend
npm test
```

## API Documentation

The GraphQL API is self-documenting and can be explored interactively at:
**http://localhost:8000/graphql**

### Example Queries

**Get all projects for an organization:**
```graphql
query {
  projects(organizationSlug: "acme-corp") {
    id
    name
    status
    taskCount
    completedTasks
    dueDate
  }
}
```

**Get project with tasks:**
```graphql
query {
  project(id: "1") {
    id
    name
    description
    tasks {
      id
      title
      status
      assigneeEmail
    }
  }
}
```

### Example Mutations

**Create a project:**
```graphql
mutation {
  createProject(
    organizationSlug: "acme-corp"
    name: "New Website"
    description: "Build company website"
    status: "ACTIVE"
  ) {
    project {
      id
      name
    }
    success
  }
}
```

**Update task status:**
```graphql
mutation {
  updateTask(
    taskId: "1"
    status: "DONE"
  ) {
    task {
      id
      status
    }
    success
  }
}
```

## Data Models

- **Organization**: Multi-tenant root entity
  - `name`, `slug`, `contact_email`, `created_at`

- **Project**: Belongs to an organization
  - `name`, `description`, `status`, `due_date`, `created_at`, `updated_at`
  - Status: ACTIVE, COMPLETED, ON_HOLD

- **Task**: Belongs to a project
  - `title`, `description`, `status`, `assignee_email`, `due_date`, `created_at`, `updated_at`
  - Status: TODO, IN_PROGRESS, DONE

- **TaskComment**: Belongs to a task
  - `content`, `author_email`, `created_at`

## Troubleshooting

### Port Already in Use

If you see errors about ports 5173, 8000, or 5432 being in use:

```bash
# Find and kill the process
# On macOS/Linux:
lsof -ti:5173 | xargs kill -9
lsof -ti:8000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

Or change the port in `docker-compose.yml`.

### Database Connection Issues

```bash
# Check if postgres is running
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Reset the database
docker-compose down -v
docker-compose up --build
```

### Frontend Not Connecting to Backend

1. Check that `VITE_GRAPHQL_URL` in `.env` is correct
2. Verify backend is running: `curl http://localhost:8000/graphql`
3. Check CORS settings in `backend/backend/settings.py`
4. Clear browser cache and restart dev server

### Migration Issues

```bash
# Remove all migrations and start fresh
docker-compose exec backend find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

## Environment Variables

Key environment variables (see `.env.example` for full list):

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `projectmanagement` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `postgres` |
| `SECRET_KEY` | Django secret key | (change in production) |
| `DEBUG` | Django debug mode | `True` |
| `VITE_GRAPHQL_URL` | GraphQL endpoint | `http://localhost:8000/graphql` |

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests to ensure everything works
4. Submit a pull request

## License

This project is created as a technical assessment.

## Contact

For questions or issues, please open a GitHub issue or contact the development team.

---

Built with Django, GraphQL, React, and TypeScript
