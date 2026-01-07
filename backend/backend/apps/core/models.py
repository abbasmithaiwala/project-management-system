"""
Data models for the project management system.

Hierarchy:
- Organization (Multi-tenant root)
  └── Project
      └── Task
          └── TaskComment
"""

from django.db import models


class Organization(models.Model):
    """
    Multi-tenant root entity. All data belongs to an organization.
    Organizations are isolated from each other.
    """
    name = models.CharField(max_length=100, help_text="Organization name")
    slug = models.SlugField(
        unique=True,
        max_length=100,
        help_text="URL-friendly identifier"
    )
    contact_email = models.EmailField(help_text="Primary contact email")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'

    def __str__(self):
        return self.name


class Project(models.Model):
    """
    Projects belong to an organization and contain tasks.
    Used to group related work items.
    """
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('ON_HOLD', 'On Hold'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='projects',
        help_text="Organization that owns this project"
    )
    name = models.CharField(max_length=200, help_text="Project name")
    description = models.TextField(blank=True, help_text="Project description")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        help_text="Current project status"
    )
    due_date = models.DateField(
        null=True,
        blank=True,
        help_text="Project deadline"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', '-created_at']),
        ]

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

    @property
    def task_count(self):
        """Total number of tasks in this project."""
        return self.tasks.count()

    @property
    def completed_task_count(self):
        """Number of completed tasks in this project."""
        return self.tasks.filter(status='DONE').count()

    @property
    def completion_rate(self):
        """Percentage of tasks completed (0-100)."""
        total = self.task_count
        if total == 0:
            return 0
        return (self.completed_task_count / total) * 100


class Task(models.Model):
    """
    Tasks belong to projects and represent individual work items.
    Can have multiple comments for collaboration.
    """
    TASK_STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tasks',
        help_text="Project this task belongs to"
    )
    title = models.CharField(max_length=200, help_text="Task title")
    description = models.TextField(blank=True, help_text="Task description")
    status = models.CharField(
        max_length=20,
        choices=TASK_STATUS_CHOICES,
        default='TODO',
        help_text="Current task status"
    )
    assignee_email = models.EmailField(
        blank=True,
        help_text="Email of person assigned to this task"
    )
    due_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Task deadline"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['project', '-created_at']),
            models.Index(fields=['assignee_email']),
        ]

    def __str__(self):
        return f"{self.project.name} - {self.title}"

    @property
    def is_overdue(self):
        """Check if task is past its due date."""
        if not self.due_date:
            return False
        from django.utils import timezone
        return self.due_date < timezone.now() and self.status != 'DONE'


class TaskComment(models.Model):
    """
    Comments on tasks for collaboration and discussion.
    """
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="Task this comment belongs to"
    )
    content = models.TextField(help_text="Comment text")
    author_email = models.EmailField(help_text="Email of comment author")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Task Comment'
        verbose_name_plural = 'Task Comments'
        indexes = [
            models.Index(fields=['task', 'created_at']),
        ]

    def __str__(self):
        return f"Comment on {self.task.title} by {self.author_email}"
