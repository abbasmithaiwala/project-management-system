#!/bin/bash

# Database Management Script for Project Management System
# Usage: ./db-manage.sh [command]

set -e

case "$1" in
  reset)
    echo "🔄 Resetting database..."
    docker-compose down -v
    echo "✅ Database volumes removed"
    docker-compose up -d
    echo "⏳ Waiting for database to be ready..."
    sleep 5
    docker-compose exec -T backend python manage.py migrate
    echo "✅ Database reset and migrations applied successfully!"
    ;;

  migrate)
    echo "🔄 Running migrations..."
    docker-compose exec -T backend python manage.py migrate
    echo "✅ Migrations applied successfully!"
    ;;

  makemigrations)
    echo "🔄 Creating migrations..."
    docker-compose exec backend python manage.py makemigrations
    echo "✅ Migrations created successfully!"
    ;;

  shell)
    echo "🐚 Opening Django shell..."
    docker-compose exec backend python manage.py shell
    ;;

  dbshell)
    echo "🐘 Opening PostgreSQL shell..."
    docker-compose exec db psql -U postgres -d projectmanagement
    ;;

  superuser)
    echo "👤 Creating superuser..."
    docker-compose exec backend python manage.py createsuperuser
    ;;

  seed)
    echo "🌱 Seeding database with sample data..."
    docker-compose exec -T backend python manage.py shell <<EOF
from backend.apps.core.models import Organization, Project, Task, TaskComment
from datetime import datetime, timedelta

# Create organizations
org1 = Organization.objects.create(
    name="Acme Corporation",
    slug="acme-corp",
    contact_email="contact@acme.com"
)

org2 = Organization.objects.create(
    name="Tech Innovators",
    slug="tech-innovators",
    contact_email="hello@techinnovators.com"
)

# Create projects for Acme
project1 = Project.objects.create(
    organization=org1,
    name="Website Redesign",
    description="Complete overhaul of company website",
    status="ACTIVE",
    due_date=datetime.now().date() + timedelta(days=30)
)

project2 = Project.objects.create(
    organization=org1,
    name="Mobile App Development",
    description="iOS and Android mobile applications",
    status="ACTIVE",
    due_date=datetime.now().date() + timedelta(days=90)
)

# Create projects for Tech Innovators
project3 = Project.objects.create(
    organization=org2,
    name="AI Research Initiative",
    description="Exploring new AI capabilities",
    status="ACTIVE",
    due_date=datetime.now().date() + timedelta(days=60)
)

# Create tasks
task1 = Task.objects.create(
    project=project1,
    title="Design mockups",
    description="Create initial design mockups for homepage",
    status="DONE",
    assignee_email="designer@acme.com"
)

task2 = Task.objects.create(
    project=project1,
    title="Develop frontend",
    description="Implement React frontend based on designs",
    status="IN_PROGRESS",
    assignee_email="developer@acme.com"
)

task3 = Task.objects.create(
    project=project1,
    title="Setup backend API",
    description="Create Django REST API endpoints",
    status="TODO",
    assignee_email="backend@acme.com"
)

task4 = Task.objects.create(
    project=project2,
    title="iOS Development",
    description="Build native iOS application",
    status="IN_PROGRESS",
    assignee_email="ios@acme.com"
)

task5 = Task.objects.create(
    project=project3,
    title="Research LLM integration",
    description="Evaluate different LLM providers",
    status="IN_PROGRESS",
    assignee_email="researcher@techinnovators.com"
)

# Create comments
TaskComment.objects.create(
    task=task1,
    content="Mockups look great! Let's proceed with implementation.",
    author_email="manager@acme.com"
)

TaskComment.objects.create(
    task=task2,
    content="Currently working on the navigation component.",
    author_email="developer@acme.com"
)

TaskComment.objects.create(
    task=task2,
    content="Need the logo assets before completing this.",
    author_email="developer@acme.com"
)

print("✅ Database seeded successfully!")
print(f"Created {Organization.objects.count()} organizations")
print(f"Created {Project.objects.count()} projects")
print(f"Created {Task.objects.count()} tasks")
print(f"Created {TaskComment.objects.count()} comments")
EOF
    ;;

  status)
    echo "📊 Database status:"
    docker-compose exec -T backend python manage.py shell <<EOF
from backend.apps.core.models import Organization, Project, Task, TaskComment
print(f"Organizations: {Organization.objects.count()}")
print(f"Projects: {Project.objects.count()}")
print(f"Tasks: {Task.objects.count()}")
print(f"Comments: {TaskComment.objects.count()}")
EOF
    ;;

  *)
    echo "Database Management Script"
    echo ""
    echo "Usage: ./db-manage.sh [command]"
    echo ""
    echo "Available commands:"
    echo "  reset          - Stop containers, remove volumes, restart and run migrations"
    echo "  migrate        - Run database migrations"
    echo "  makemigrations - Create new migrations based on model changes"
    echo "  shell          - Open Django Python shell"
    echo "  dbshell        - Open PostgreSQL database shell"
    echo "  superuser      - Create a Django superuser"
    echo "  seed           - Seed database with sample data"
    echo "  status         - Show database statistics"
    echo ""
    echo "Examples:"
    echo "  ./db-manage.sh reset       # Reset the database completely"
    echo "  ./db-manage.sh migrate     # Run migrations"
    echo "  ./db-manage.sh seed        # Add sample data"
    exit 1
    ;;
esac
