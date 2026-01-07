import { ApolloError } from '@apollo/client';

/**
 * Determines if a GraphQL error indicates a "not found" scenario
 */
export const isNotFoundError = (error: ApolloError | Error): boolean => {
  if (error instanceof ApolloError) {
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes('not found') ||
      errorMessage.includes('does not exist') ||
      errorMessage.includes("doesn't exist")
    );
  }
  return false;
};

/**
 * Extracts entity type from error message
 * Example: "Organization with slug 'xyz' not found" -> "Organization"
 */
export const getNotFoundEntity = (error: ApolloError | Error): string | null => {
  if (error instanceof ApolloError) {
    const match = error.message.match(/^(\w+)\s+with/i);
    return match ? match[1] : null;
  }
  return null;
};
