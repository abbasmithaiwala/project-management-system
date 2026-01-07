# Project Management System - AI Context Documentation

## Project Overview

This is a **multi-tenant project management system**. The system allows organizations to manage projects, tasks, and task comments with complete data isolation between organizations.

### Hierarchy
```
Organization (Multi-tenant root)
    └── Projects (Multiple per organization)
        └── Tasks (Multiple per project)
            └── Comments (Multiple per task)
```

### Core Purpose
- Demonstrate proficiency with modern full-stack development
- Showcase Django + GraphQL + React + TypeScript expertise
- Implement proper multi-tenancy patterns
- Follow production-ready architectural patterns

## Architecture

### System Architecture
```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │ ───────▶│  Django Backend  │ ───────▶│   PostgreSQL    │
│  (Port 5173)    │  HTTP   │  (Port 8000)     │  SQL    │   (Port 5432)   │
│                 │  GraphQL│                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                           │
        │                           │
        └───── Apollo Client ───────┘
              (GraphQL Queries/Mutations)
```

### Monorepo Structure
```
/
├── backend/                 # Django + GraphQL API
├── frontend/                # React + TypeScript SPA
├── docker-compose.yml       # Orchestrates all services
├── .env.example            # Environment variables template
├── README.md               # Setup instructions
└── Claude.md               # This file
```

## Tech Stack

### Backend
- **Framework**: Django 4.2+ (Python web framework)
- **API Layer**: Graphene-Django 3.0+ (GraphQL for Django)
- **Database**: PostgreSQL 15+ (Relational database)
- **ORM**: Django ORM (Built-in object-relational mapper)
- **CORS**: django-cors-headers (Cross-origin resource sharing)
- **Testing**: pytest-django, pytest-cov

### Frontend
- **Framework**: React 18.2+ (UI library)
- **Language**: TypeScript 5.2+ (Type-safe JavaScript)
- **GraphQL Client**: Apollo Client 3.8+ (State management + data fetching)
- **Styling**: TailwindCSS 3.4+ (Utility-first CSS framework)
- **Build Tool**: Vite 5.0+ (Fast build tool and dev server)
- **Routing**: React Router v6

### Development Tools
- **Containerization**: Docker + Docker Compose
- **Code Quality**: ESLint, Prettier (Frontend), Black, flake8 (Backend)
- **Version Control**: Git

## Project Structure

### Backend Structure
```
backend/
├── manage.py                 # Django CLI entry point
├── requirements.txt          # Python dependencies
├── Dockerfile               # Backend container image
├── pytest.ini               # Test configuration
├── .env.example             # Backend environment variables
└── backend/                 # Django project (settings, URLs, etc.)
    ├── __init__.py
    ├── settings.py          # Django configuration
    ├── urls.py              # URL routing
    ├── wsgi.py              # WSGI server entry point
    ├── asgi.py              # ASGI server entry point
    └── apps/
        └── core/            # Main application
            ├── models.py    # Database models
            ├── schema.py    # GraphQL schema
            ├── admin.py     # Django admin configuration
            ├── apps.py      # App configuration
            ├── middleware.py # Custom middleware
            ├── migrations/  # Database migrations
            └── tests/       # Test files
```

### Frontend Structure
```
frontend/
├── package.json             # Node dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── Dockerfile               # Frontend container image
├── .env.example             # Frontend environment variables
├── index.html               # HTML entry point
└── src/
    ├── main.tsx             # React entry point
    ├── App.tsx              # Root component with routing
    ├── apollo-client.ts     # Apollo Client configuration
    ├── types/               # TypeScript type definitions
    │   └── index.ts
    ├── components/          # Reusable UI components
    │   ├── common/          # Generic components (Button, Input, etc.)
    │   ├── ProjectList.tsx
    │   ├── ProjectForm.tsx
    │   ├── TaskBoard.tsx
    │   └── TaskComments.tsx
    ├── pages/               # Page components (route targets)
    │   ├── Dashboard.tsx
    │   └── ProjectDetail.tsx
    ├── graphql/             # GraphQL operations
    │   ├── queries.ts
    │   └── mutations.ts
    ├── hooks/               # Custom React hooks
    │   └── useProjects.ts
    └── styles/              # Global styles
        └── index.css
```

## Data Models

### Django Models

```python
# backend/backend/apps/core/models.py

from django.db import models

class Organization(models.Model):
    """
    Multi-tenant root entity. All data belongs to an organization.
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=100)
    contact_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Project(models.Model):
    """
    Projects belong to an organization and contain tasks.
    """
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('ON_HOLD', 'On Hold'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.organization.name} - {self.name}"


class Task(models.Model):
    """
    Tasks belong to projects and can have comments.
    """
    TASK_STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=TASK_STATUS_CHOICES, default='TODO')
    assignee_email = models.EmailField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.project.name} - {self.title}"


class TaskComment(models.Model):
    """
    Comments on tasks for collaboration.
    """
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    content = models.TextField()
    author_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment on {self.task.title} by {self.author_email}"
```

## GraphQL Schema

### Type Definitions

```python
# backend/backend/apps/core/schema.py (excerpt)

import graphene
from graphene_django import DjangoObjectType
from .models import Organization, Project, Task, TaskComment

class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = ('id', 'name', 'slug', 'contact_email', 'created_at', 'projects')

class ProjectType(DjangoObjectType):
    task_count = graphene.Int()
    completed_tasks = graphene.Int()

    class Meta:
        model = Project
        fields = ('id', 'organization', 'name', 'description', 'status',
                 'due_date', 'created_at', 'updated_at', 'tasks')

    def resolve_task_count(self, info):
        return self.tasks.count()

    def resolve_completed_tasks(self, info):
        return self.tasks.filter(status='DONE').count()

class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = ('id', 'project', 'title', 'description', 'status',
                 'assignee_email', 'due_date', 'created_at', 'updated_at', 'comments')

class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = ('id', 'task', 'content', 'author_email', 'created_at')
```

### Query Examples

```python
class Query(graphene.ObjectType):
    # List all projects for an organization
    projects = graphene.List(ProjectType, organization_slug=graphene.String(required=True))

    # Get single project by ID
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))

    # List tasks for a project
    tasks = graphene.List(TaskType, project_id=graphene.ID(required=True))

    def resolve_projects(self, info, organization_slug):
        """
        Returns projects for a specific organization.
        Implements multi-tenancy by filtering on organization.
        """
        return Project.objects.filter(organization__slug=organization_slug)

    def resolve_project(self, info, id):
        return Project.objects.get(pk=id)

    def resolve_tasks(self, info, project_id):
        return Task.objects.filter(project_id=project_id)
```

### Mutation Examples

```python
class CreateProject(graphene.Mutation):
    class Arguments:
        organization_slug = graphene.String(required=True)
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)
    success = graphene.Boolean()

    def mutate(self, info, organization_slug, name, **kwargs):
        organization = Organization.objects.get(slug=organization_slug)
        project = Project.objects.create(
            organization=organization,
            name=name,
            **kwargs
        )
        return CreateProject(project=project, success=True)


class UpdateTask(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        status = graphene.String()
        assignee_email = graphene.String()

    task = graphene.Field(TaskType)
    success = graphene.Boolean()

    def mutate(self, info, task_id, **kwargs):
        task = Task.objects.get(pk=task_id)
        for key, value in kwargs.items():
            setattr(task, key, value)
        task.save()
        return UpdateTask(task=task, success=True)
```

## TypeScript Interfaces

```typescript
// frontend/src/types/index.ts

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  createdAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  dueDate?: string;
  taskCount: number;
  completedTasks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assigneeEmail: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  authorEmail: string;
  createdAt: string;
}
```

## Multi-Tenancy Implementation

### Approach
All data is scoped to an `Organization`. Multi-tenancy is enforced through:

1. **Database Level**: Foreign key relationships ensure data hierarchy
2. **API Level**: GraphQL queries require `organization_slug` parameter
3. **Middleware Level** (future): Context-based organization filtering

### Example Pattern

```python
# Every query filters by organization
def resolve_projects(self, info, organization_slug):
    # Multi-tenancy enforcement: only return projects for this org
    return Project.objects.filter(organization__slug=organization_slug)

# Mutations verify organization ownership
def mutate(self, info, project_id, **kwargs):
    project = Project.objects.get(pk=project_id)
    # TODO: Verify project.organization matches current user's organization
    project.update(**kwargs)
    return project
```

### Future Enhancements
- Organization context middleware to auto-filter queries
- User authentication with organization membership
- GraphQL context injection for automatic tenant isolation

## Apollo Client Setup

```typescript
// frontend/src/apollo-client.ts

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL error]: Message: ${message}, Path: ${path}`)
    );
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// HTTP connection to the API
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql',
});

// Apollo Client instance
const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Project: {
        fields: {
          // Custom cache merge strategies
          tasks: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default client;
```

## Development Workflow

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd project-management-system

# 2. Copy environment variables
cp .env.example .env

# 3. Start all services with Docker
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:8000/graphql
# - GraphiQL: http://localhost:8000/graphql (interactive playground)
# - PostgreSQL: localhost:5432
```

### Without Docker (Manual Setup)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Common Commands

```bash
# Create Django migrations
docker-compose exec backend python manage.py makemigrations

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Run backend tests
docker-compose exec backend pytest

# Run frontend tests
docker-compose exec frontend npm test

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v
```

## Code Style Guidelines

### Python (Backend)
- **Style Guide**: PEP 8
- **Line Length**: 100 characters
- **Docstrings**: Google style
- **Imports**: Group by standard library, third-party, local
- **Type Hints**: Use where appropriate

```python
# Good
def create_project(organization: Organization, name: str, **kwargs) -> Project:
    """
    Create a new project for an organization.

    Args:
        organization: The organization that owns the project
        name: Project name
        **kwargs: Additional project fields

    Returns:
        The created Project instance
    """
    return Project.objects.create(
        organization=organization,
        name=name,
        **kwargs
    )
```

### TypeScript (Frontend)
- **Style Guide**: Airbnb TypeScript
- **Component Style**: Functional components with hooks
- **Props**: Use interface definitions
- **Naming**: PascalCase for components, camelCase for functions/variables

```typescript
// Good
interface ProjectListProps {
  organizationSlug: string;
  onSelectProject: (project: Project) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  organizationSlug,
  onSelectProject
}) => {
  const { data, loading, error } = useQuery(GET_PROJECTS, {
    variables: { organizationSlug },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-4">
      {data.projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => onSelectProject(project)}
        />
      ))}
    </div>
  );
};
```

## Testing Strategy

### Backend Tests (pytest)

```python
# backend/backend/apps/core/tests/test_models.py

import pytest
from backend.apps.core.models import Organization, Project

@pytest.mark.django_db
class TestOrganization:
    def test_create_organization(self):
        org = Organization.objects.create(
            name="Test Org",
            slug="test-org",
            contact_email="test@example.com"
        )
        assert org.name == "Test Org"
        assert str(org) == "Test Org"

    def test_organization_slug_unique(self):
        Organization.objects.create(name="Org 1", slug="test", contact_email="a@example.com")
        with pytest.raises(Exception):
            Organization.objects.create(name="Org 2", slug="test", contact_email="b@example.com")

@pytest.mark.django_db
class TestProject:
    def test_create_project(self):
        org = Organization.objects.create(
            name="Test Org",
            slug="test-org",
            contact_email="test@example.com"
        )
        project = Project.objects.create(
            organization=org,
            name="Test Project",
            status="ACTIVE"
        )
        assert project.organization == org
        assert project.status == "ACTIVE"
```

### Frontend Tests (Jest/React Testing Library)

```typescript
// frontend/src/components/__tests__/ProjectList.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ProjectList } from '../ProjectList';
import { GET_PROJECTS } from '../../graphql/queries';

const mocks = [
  {
    request: {
      query: GET_PROJECTS,
      variables: { organizationSlug: 'test-org' },
    },
    result: {
      data: {
        projects: [
          { id: '1', name: 'Project 1', status: 'ACTIVE' },
          { id: '2', name: 'Project 2', status: 'COMPLETED' },
        ],
      },
    },
  },
];

test('renders project list', async () => {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ProjectList organizationSlug="test-org" onSelectProject={jest.fn()} />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
  });
});
```

## Environment Variables

### Backend (.env)
```bash
# Database
POSTGRES_DB=projectmanagement
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Django
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_GRAPHQL_URL=http://localhost:8000/graphql
VITE_APP_TITLE=Project Management System
```

## Common Tasks & Troubleshooting

### Add a new Django model field

```bash
# 1. Edit backend/backend/apps/core/models.py
# 2. Create migration
docker-compose exec backend python manage.py makemigrations
# 3. Apply migration
docker-compose exec backend python manage.py migrate
```

### Add a new GraphQL query

```python
# 1. Add to backend/backend/apps/core/schema.py Query class
class Query(graphene.ObjectType):
    new_query = graphene.Field(SomeType, arg=graphene.String())

    def resolve_new_query(self, info, arg):
        return SomeModel.objects.filter(field=arg).first()

# 2. Test in GraphiQL at http://localhost:8000/graphql
```

### Add a new React component

```typescript
// 1. Create file in frontend/src/components/MyComponent.tsx
export const MyComponent: React.FC = () => {
  return <div>Hello</div>;
};

// 2. Import and use in parent component
import { MyComponent } from './components/MyComponent';
```

### Database connection issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up --build
```

### Frontend not connecting to backend

```bash
# 1. Check VITE_GRAPHQL_URL in frontend/.env
# 2. Verify backend is running: curl http://localhost:8000/graphql
# 3. Check CORS settings in backend/backend/settings.py
# 4. Clear browser cache and restart frontend dev server
```

## API Documentation

All GraphQL queries and mutations can be explored interactively at:
**http://localhost:8000/graphql** (GraphiQL interface)

### Example Queries

```graphql
# Get all projects for an organization
query GetProjects {
  projects(organizationSlug: "acme-corp") {
    id
    name
    status
    taskCount
    completedTasks
  }
}

# Get project with tasks
query GetProject {
  project(id: "1") {
    id
    name
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

```graphql
# Create a project
mutation CreateProject {
  createProject(
    organizationSlug: "acme-corp"
    name: "New Project"
    description: "Description here"
    status: "ACTIVE"
  ) {
    project {
      id
      name
    }
    success
  }
}

# Update task status
mutation UpdateTask {
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

## Production Considerations

### Security
- [ ] Change SECRET_KEY in production
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS properly
- [ ] Use environment-specific CORS settings
- [ ] Implement authentication and authorization
- [ ] Add rate limiting to API
- [ ] Use HTTPS in production

### Performance
- [ ] Enable Django query optimization (select_related, prefetch_related)
- [ ] Configure PostgreSQL connection pooling
- [ ] Add Redis for caching
- [ ] Optimize GraphQL queries (DataLoader for N+1 prevention)
- [ ] Enable frontend code splitting
- [ ] Add CDN for static assets

### Monitoring
- [ ] Add logging (Django logging, frontend error tracking)
- [ ] Set up APM (Application Performance Monitoring)
- [ ] Configure health check endpoints
- [ ] Add database query monitoring

## Future Enhancements

1. **Authentication & Authorization**
   - User accounts with organization membership
   - Role-based access control (Admin, Member, Viewer)
   - JWT token authentication

2. **Real-time Features**
   - WebSocket subscriptions for live updates
   - Real-time task board updates
   - Notification system

3. **Advanced Features**
   - File attachments on tasks
   - Task dependencies and subtasks
   - Project templates
   - Time tracking
   - Gantt chart view
   - Search and filtering

4. **DevOps**
   - CI/CD pipeline (GitHub Actions)
   - Automated testing
   - Staging environment
   - Production deployment (AWS/GCP/Azure)

## Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **Graphene Documentation**: https://docs.graphene-python.org/
- **React Documentation**: https://react.dev/
- **Apollo Client Documentation**: https://www.apollographql.com/docs/react/
- **TailwindCSS Documentation**: https://tailwindcss.com/docs

---

**Last Updated**: 2026-01-07
**Project Status**: Initial Setup Phase
