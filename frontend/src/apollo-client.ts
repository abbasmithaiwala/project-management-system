/**
 * Apollo Client configuration for GraphQL.
 * Handles communication with the Django GraphQL backend.
 */

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// HTTP connection to the API
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql/',
  credentials: 'same-origin',
});

// Apollo Client instance
const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          projects: {
            // Merge strategy for projects list
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          tasks: {
            // Merge strategy for tasks list
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      Project: {
        fields: {
          tasks: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      Task: {
        fields: {
          comments: {
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
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client;
