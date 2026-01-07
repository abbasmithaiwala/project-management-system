/**
 * GraphQL queries for fetching data.
 */

import { gql } from '@apollo/client';

export const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
      slug
      contactEmail
      createdAt
    }
  }
`;

export const GET_ORGANIZATION = gql`
  query GetOrganization($slug: String!) {
    organization(slug: $slug) {
      id
      name
      slug
      contactEmail
      createdAt
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects($organizationSlug: String!, $status: String) {
    projects(organizationSlug: $organizationSlug, status: $status) {
      id
      name
      description
      status
      dueDate
      taskCount
      completedTasks
      completionRate
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      dueDate
      taskCount
      completedTasks
      completionRate
      createdAt
      updatedAt
      organization {
        id
        name
        slug
      }
      tasks {
        id
        title
        description
        status
        assigneeEmail
        dueDate
        isOverdue
        commentCount
        createdAt
      }
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks($projectId: ID!, $status: String) {
    tasks(projectId: $projectId, status: $status) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      isOverdue
      createdAt
      updatedAt
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      isOverdue
      createdAt
      updatedAt
      project {
        id
        name
      }
      comments {
        id
        content
        authorEmail
        createdAt
      }
    }
  }
`;

export const GET_TASK_COMMENTS = gql`
  query GetTaskComments($taskId: ID!) {
    taskComments(taskId: $taskId) {
      id
      content
      authorEmail
      createdAt
    }
  }
`;
