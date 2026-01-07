/**
 * TypeScript type definitions for the project management system.
 * These interfaces match the Django models and GraphQL schema.
 */

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  createdAt: string;
}

export interface Project {
  id: string;
  organization?: Organization;
  name: string;
  description: string;
  status: ProjectStatus;
  dueDate?: string;
  taskCount?: number;
  completedTasks?: number;
  completionRate?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';

export interface Task {
  id: string;
  project?: Project;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeEmail: string;
  dueDate?: string;
  isOverdue?: boolean;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface TaskComment {
  id: string;
  task?: Task;
  content: string;
  authorEmail: string;
  createdAt: string;
}

// Form input types
export interface CreateProjectInput {
  organizationSlug: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: string;
}

export interface UpdateProjectInput {
  projectId: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: string;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  taskId: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface CreateTaskCommentInput {
  taskId: string;
  content: string;
  authorEmail: string;
}
