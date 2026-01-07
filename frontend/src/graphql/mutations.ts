/**
 * GraphQL mutations for creating and updating data.
 */

import { gql } from '@apollo/client';

export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($name: String!, $slug: String!, $contactEmail: String!) {
    createOrganization(name: $name, slug: $slug, contactEmail: $contactEmail) {
      organization {
        id
        name
        slug
        contactEmail
      }
      success
      errors
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $organizationSlug: String!
    $name: String!
    $description: String
    $status: String
    $dueDate: Date
  ) {
    createProject(
      organizationSlug: $organizationSlug
      name: $name
      description: $description
      status: $status
      dueDate: $dueDate
    ) {
      project {
        id
        name
        description
        status
        dueDate
        createdAt
      }
      success
      errors
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $projectId: ID!
    $name: String
    $description: String
    $status: String
    $dueDate: Date
  ) {
    updateProject(
      projectId: $projectId
      name: $name
      description: $description
      status: $status
      dueDate: $dueDate
    ) {
      project {
        id
        name
        description
        status
        dueDate
        updatedAt
      }
      success
      errors
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask(
    $projectId: ID!
    $title: String!
    $description: String
    $status: String
    $assigneeEmail: String
    $dueDate: DateTime
  ) {
    createTask(
      projectId: $projectId
      title: $title
      description: $description
      status: $status
      assigneeEmail: $assigneeEmail
      dueDate: $dueDate
    ) {
      task {
        id
        title
        description
        status
        assigneeEmail
        dueDate
        createdAt
      }
      success
      errors
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $taskId: ID!
    $title: String
    $description: String
    $status: String
    $assigneeEmail: String
    $dueDate: DateTime
  ) {
    updateTask(
      taskId: $taskId
      title: $title
      description: $description
      status: $status
      assigneeEmail: $assigneeEmail
      dueDate: $dueDate
    ) {
      task {
        id
        title
        description
        status
        assigneeEmail
        dueDate
        updatedAt
      }
      success
      errors
    }
  }
`;

export const CREATE_TASK_COMMENT = gql`
  mutation CreateTaskComment($taskId: ID!, $content: String!, $authorEmail: String!) {
    createTaskComment(taskId: $taskId, content: $content, authorEmail: $authorEmail) {
      comment {
        id
        content
        authorEmail
        createdAt
      }
      success
      errors
    }
  }
`;
