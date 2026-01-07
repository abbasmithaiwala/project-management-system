"""
Django admin configuration for the core app.
"""

from django.contrib import admin
from .models import Organization, Project, Task, TaskComment


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'contact_email', 'created_at')
    search_fields = ('name', 'slug', 'contact_email')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'status', 'due_date', 'created_at')
    list_filter = ('status', 'organization', 'created_at')
    search_fields = ('name', 'description', 'organization__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Basic Information', {
            'fields': ('organization', 'name', 'description')
        }),
        ('Status & Dates', {
            'fields': ('status', 'due_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'status', 'assignee_email', 'due_date', 'created_at')
    list_filter = ('status', 'project__organization', 'created_at')
    search_fields = ('title', 'description', 'assignee_email', 'project__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Basic Information', {
            'fields': ('project', 'title', 'description')
        }),
        ('Assignment & Status', {
            'fields': ('status', 'assignee_email', 'due_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'author_email', 'content_preview', 'created_at')
    list_filter = ('created_at', 'task__project__organization')
    search_fields = ('content', 'author_email', 'task__title')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'

    def content_preview(self, obj):
        """Show first 50 characters of comment content."""
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content

    content_preview.short_description = 'Content'
