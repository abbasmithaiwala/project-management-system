"""
GraphQL schema for the project management system.

Provides queries and mutations for:
- Organizations
- Projects
- Tasks
- Task Comments
"""

import graphene
from graphene_django import DjangoObjectType
from .models import Organization, Project, Task, TaskComment


# Object Types

class OrganizationType(DjangoObjectType):
    """GraphQL type for Organization model."""
    class Meta:
        model = Organization
        fields = ('id', 'name', 'slug', 'contact_email', 'created_at', 'projects')


class ProjectType(DjangoObjectType):
    """GraphQL type for Project model with computed fields."""
    task_count = graphene.Int()
    completed_tasks = graphene.Int()
    completion_rate = graphene.Float()

    class Meta:
        model = Project
        fields = (
            'id', 'organization', 'name', 'description', 'status',
            'due_date', 'created_at', 'updated_at', 'tasks'
        )

    def resolve_task_count(self, info):
        """Total number of tasks in this project."""
        return self.tasks.count()

    def resolve_completed_tasks(self, info):
        """Number of completed tasks."""
        return self.tasks.filter(status='DONE').count()

    def resolve_completion_rate(self, info):
        """Percentage of tasks completed."""
        return self.completion_rate


class TaskType(DjangoObjectType):
    """GraphQL type for Task model with computed fields."""
    is_overdue = graphene.Boolean()
    comment_count = graphene.Int()

    class Meta:
        model = Task
        fields = (
            'id', 'project', 'title', 'description', 'status',
            'assignee_email', 'due_date', 'created_at', 'updated_at', 'comments'
        )

    def resolve_is_overdue(self, info):
        """Check if task is past its due date."""
        return self.is_overdue

    def resolve_comment_count(self, info):
        """Total number of comments on this task."""
        return self.comments.count()


class TaskCommentType(DjangoObjectType):
    """GraphQL type for TaskComment model."""
    class Meta:
        model = TaskComment
        fields = ('id', 'task', 'content', 'author_email', 'created_at')


# Queries

class Query(graphene.ObjectType):
    """Root query type."""

    # Organization queries
    organizations = graphene.List(OrganizationType)
    organization = graphene.Field(OrganizationType, slug=graphene.String(required=True))

    # Project queries
    projects = graphene.List(
        ProjectType,
        organization_slug=graphene.String(required=True),
        status=graphene.String()
    )
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))

    # Task queries
    tasks = graphene.List(
        TaskType,
        project_id=graphene.ID(required=True),
        status=graphene.String()
    )
    task = graphene.Field(TaskType, id=graphene.ID(required=True))

    # Comment queries
    task_comments = graphene.List(TaskCommentType, task_id=graphene.ID(required=True))

    # Organization resolvers
    def resolve_organizations(self, info):
        """Get all organizations."""
        return Organization.objects.all()

    def resolve_organization(self, info, slug):
        """Get organization by slug."""
        try:
            return Organization.objects.get(slug=slug)
        except Organization.DoesNotExist:
            return None

    # Project resolvers
    def resolve_projects(self, info, organization_slug, status=None):
        """
        Get projects for an organization.
        Implements multi-tenancy by filtering on organization.
        Raises Exception if organization doesn't exist.
        """
        # Validate organization exists
        try:
            organization = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            raise Exception(f"Organization with slug '{organization_slug}' not found")

        # Filter projects by organization
        queryset = Project.objects.filter(organization=organization)
        if status:
            queryset = queryset.filter(status=status)
        return queryset.select_related('organization').prefetch_related('tasks')

    def resolve_project(self, info, id):
        """Get single project by ID."""
        try:
            return Project.objects.select_related('organization').prefetch_related('tasks').get(pk=id)
        except Project.DoesNotExist:
            raise Exception(f"Project with ID '{id}' not found")

    # Task resolvers
    def resolve_tasks(self, info, project_id, status=None):
        """Get tasks for a project."""
        # Validate project exists
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            raise Exception(f"Project with ID '{project_id}' not found")

        queryset = Task.objects.filter(project=project)
        if status:
            queryset = queryset.filter(status=status)
        return queryset.select_related('project').prefetch_related('comments')

    def resolve_task(self, info, id):
        """Get single task by ID."""
        try:
            return Task.objects.select_related('project').prefetch_related('comments').get(pk=id)
        except Task.DoesNotExist:
            return None

    # Comment resolvers
    def resolve_task_comments(self, info, task_id):
        """Get comments for a task."""
        return TaskComment.objects.filter(task_id=task_id).select_related('task')


# Mutations

class CreateOrganization(graphene.Mutation):
    """Create a new organization."""
    class Arguments:
        name = graphene.String(required=True)
        slug = graphene.String(required=True)
        contact_email = graphene.String(required=True)

    organization = graphene.Field(OrganizationType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, name, slug, contact_email):
        try:
            organization = Organization.objects.create(
                name=name,
                slug=slug,
                contact_email=contact_email
            )
            return CreateOrganization(organization=organization, success=True, errors=[])
        except Exception as e:
            return CreateOrganization(organization=None, success=False, errors=[str(e)])


class CreateProject(graphene.Mutation):
    """Create a new project."""
    class Arguments:
        organization_slug = graphene.String(required=True)
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, organization_slug, name, **kwargs):
        try:
            organization = Organization.objects.get(slug=organization_slug)
            project = Project.objects.create(
                organization=organization,
                name=name,
                **kwargs
            )
            return CreateProject(project=project, success=True, errors=[])
        except Organization.DoesNotExist:
            return CreateProject(
                project=None,
                success=False,
                errors=[f"Organization with slug '{organization_slug}' not found"]
            )
        except Exception as e:
            return CreateProject(project=None, success=False, errors=[str(e)])


class UpdateProject(graphene.Mutation):
    """Update an existing project."""
    class Arguments:
        project_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, project_id, **kwargs):
        try:
            project = Project.objects.get(pk=project_id)
            for key, value in kwargs.items():
                if value is not None:
                    setattr(project, key, value)
            project.save()
            return UpdateProject(project=project, success=True, errors=[])
        except Project.DoesNotExist:
            return UpdateProject(
                project=None,
                success=False,
                errors=[f"Project with ID '{project_id}' not found"]
            )
        except Exception as e:
            return UpdateProject(project=None, success=False, errors=[str(e)])


class CreateTask(graphene.Mutation):
    """Create a new task."""
    class Arguments:
        project_id = graphene.ID(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, project_id, title, **kwargs):
        try:
            project = Project.objects.get(pk=project_id)
            task = Task.objects.create(
                project=project,
                title=title,
                **kwargs
            )
            return CreateTask(task=task, success=True, errors=[])
        except Project.DoesNotExist:
            return CreateTask(
                task=None,
                success=False,
                errors=[f"Project with ID '{project_id}' not found"]
            )
        except Exception as e:
            return CreateTask(task=None, success=False, errors=[str(e)])


class UpdateTask(graphene.Mutation):
    """Update an existing task."""
    class Arguments:
        task_id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, task_id, **kwargs):
        try:
            task = Task.objects.get(pk=task_id)
            for key, value in kwargs.items():
                if value is not None:
                    setattr(task, key, value)
            task.save()
            return UpdateTask(task=task, success=True, errors=[])
        except Task.DoesNotExist:
            return UpdateTask(
                task=None,
                success=False,
                errors=[f"Task with ID '{task_id}' not found"]
            )
        except Exception as e:
            return UpdateTask(task=None, success=False, errors=[str(e)])


class CreateTaskComment(graphene.Mutation):
    """Create a new task comment."""
    class Arguments:
        task_id = graphene.ID(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, task_id, content, author_email):
        try:
            task = Task.objects.get(pk=task_id)
            comment = TaskComment.objects.create(
                task=task,
                content=content,
                author_email=author_email
            )
            return CreateTaskComment(comment=comment, success=True, errors=[])
        except Task.DoesNotExist:
            return CreateTaskComment(
                comment=None,
                success=False,
                errors=[f"Task with ID '{task_id}' not found"]
            )
        except Exception as e:
            return CreateTaskComment(comment=None, success=False, errors=[str(e)])


class Mutation(graphene.ObjectType):
    """Root mutation type."""
    create_organization = CreateOrganization.Field()
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    create_task_comment = CreateTaskComment.Field()


# Schema
schema = graphene.Schema(query=Query, mutation=Mutation)
