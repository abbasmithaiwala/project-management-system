"""
Tests for core models.
"""

import pytest
from django.utils import timezone
from backend.apps.core.models import Organization, Project, Task, TaskComment


@pytest.mark.django_db
class TestOrganization:
    """Tests for Organization model."""

    def test_create_organization(self):
        """Test creating an organization."""
        org = Organization.objects.create(
            name="Test Org",
            slug="test-org",
            contact_email="test@example.com"
        )
        assert org.name == "Test Org"
        assert org.slug == "test-org"
        assert str(org) == "Test Org"

    def test_organization_slug_unique(self):
        """Test that organization slugs must be unique."""
        Organization.objects.create(
            name="Org 1",
            slug="test",
            contact_email="a@example.com"
        )
        with pytest.raises(Exception):
            Organization.objects.create(
                name="Org 2",
                slug="test",
                contact_email="b@example.com"
            )


@pytest.mark.django_db
class TestProject:
    """Tests for Project model."""

    def test_create_project(self):
        """Test creating a project."""
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
        assert project.name in str(project)

    def test_project_task_count(self):
        """Test project task count property."""
        org = Organization.objects.create(
            name="Test Org",
            slug="test-org",
            contact_email="test@example.com"
        )
        project = Project.objects.create(
            organization=org,
            name="Test Project"
        )
        assert project.task_count == 0

        Task.objects.create(project=project, title="Task 1")
        Task.objects.create(project=project, title="Task 2")

        assert project.task_count == 2


@pytest.mark.django_db
class TestTask:
    """Tests for Task model."""

    def test_create_task(self):
        """Test creating a task."""
        org = Organization.objects.create(
            name="Test Org",
            slug="test-org",
            contact_email="test@example.com"
        )
        project = Project.objects.create(
            organization=org,
            name="Test Project"
        )
        task = Task.objects.create(
            project=project,
            title="Test Task",
            status="TODO"
        )
        assert task.project == project
        assert task.status == "TODO"
        assert task.title in str(task)

    def test_task_is_overdue(self):
        """Test task overdue property."""
        org = Organization.objects.create(
            name="Test Org",
            slug="test-org",
            contact_email="test@example.com"
        )
        project = Project.objects.create(
            organization=org,
            name="Test Project"
        )

        # Task without due date
        task1 = Task.objects.create(
            project=project,
            title="Task 1"
        )
        assert task1.is_overdue is False

        # Overdue task
        task2 = Task.objects.create(
            project=project,
            title="Task 2",
            due_date=timezone.now() - timezone.timedelta(days=1)
        )
        assert task2.is_overdue is True


@pytest.mark.django_db
class TestTaskComment:
    """Tests for TaskComment model."""

    def test_create_comment(self):
        """Test creating a task comment."""
        org = Organization.objects.create(
            name="Test Org",
            slug="test-org",
            contact_email="test@example.com"
        )
        project = Project.objects.create(
            organization=org,
            name="Test Project"
        )
        task = Task.objects.create(
            project=project,
            title="Test Task"
        )
        comment = TaskComment.objects.create(
            task=task,
            content="Test comment",
            author_email="author@example.com"
        )
        assert comment.task == task
        assert comment.content == "Test comment"
        assert "Test Task" in str(comment)
