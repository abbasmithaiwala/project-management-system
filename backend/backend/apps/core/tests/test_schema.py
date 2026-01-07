"""
Tests for GraphQL schema.
"""

import pytest
from graphene.test import Client
from backend.apps.core.schema import schema
from backend.apps.core.models import Organization, Project


@pytest.mark.django_db
class TestGraphQLQueries:
    """Tests for GraphQL queries."""

    def test_organizations_query(self):
        """Test querying all organizations."""
        Organization.objects.create(
            name="Org 1",
            slug="org-1",
            contact_email="org1@example.com"
        )
        Organization.objects.create(
            name="Org 2",
            slug="org-2",
            contact_email="org2@example.com"
        )

        client = Client(schema)
        query = '''
            query {
                organizations {
                    name
                    slug
                }
            }
        '''
        result = client.execute(query)
        assert len(result['data']['organizations']) == 2

    def test_projects_query(self):
        """Test querying projects for an organization."""
        org = Organization.objects.create(
            name="Test Org",
            slug="test-org",
            contact_email="test@example.com"
        )
        Project.objects.create(
            organization=org,
            name="Project 1",
            status="ACTIVE"
        )
        Project.objects.create(
            organization=org,
            name="Project 2",
            status="COMPLETED"
        )

        client = Client(schema)
        query = '''
            query {
                projects(organizationSlug: "test-org") {
                    name
                    status
                }
            }
        '''
        result = client.execute(query)
        assert len(result['data']['projects']) == 2

    def test_projects_query_nonexistent_organization(self):
        """Test that querying projects for non-existent org raises error."""
        client = Client(schema)
        query = '''
            query {
                projects(organizationSlug: "nonexistent-org") {
                    name
                }
            }
        '''
        result = client.execute(query)
        assert result.get('errors') is not None
        assert "Organization with slug 'nonexistent-org' not found" in str(result['errors'][0])

    def test_projects_query_empty_organization(self):
        """Test that org with no projects returns empty list (not error)."""
        Organization.objects.create(
            name="Empty Org",
            slug="empty-org",
            contact_email="empty@example.com"
        )

        client = Client(schema)
        query = '''
            query {
                projects(organizationSlug: "empty-org") {
                    name
                }
            }
        '''
        result = client.execute(query)
        assert result.get('errors') is None
        assert len(result['data']['projects']) == 0

    def test_project_query_nonexistent(self):
        """Test that querying non-existent project raises error."""
        client = Client(schema)
        query = '''
            query {
                project(id: "99999") {
                    name
                }
            }
        '''
        result = client.execute(query)
        assert result.get('errors') is not None
        assert "Project with ID '99999' not found" in str(result['errors'][0])


@pytest.mark.django_db
class TestGraphQLMutations:
    """Tests for GraphQL mutations."""

    def test_create_organization_mutation(self):
        """Test creating an organization via mutation."""
        client = Client(schema)
        mutation = '''
            mutation {
                createOrganization(
                    name: "New Org"
                    slug: "new-org"
                    contactEmail: "new@example.com"
                ) {
                    organization {
                        name
                        slug
                    }
                    success
                }
            }
        '''
        result = client.execute(mutation)
        assert result['data']['createOrganization']['success'] is True
        assert result['data']['createOrganization']['organization']['name'] == "New Org"

    def test_create_project_mutation(self):
        """Test creating a project via mutation."""
        Organization.objects.create(
            name="Test Org",
            slug="test-org",
            contact_email="test@example.com"
        )

        client = Client(schema)
        mutation = '''
            mutation {
                createProject(
                    organizationSlug: "test-org"
                    name: "New Project"
                    status: "ACTIVE"
                ) {
                    project {
                        name
                        status
                    }
                    success
                }
            }
        '''
        result = client.execute(mutation)
        assert result['data']['createProject']['success'] is True
        assert result['data']['createProject']['project']['name'] == "New Project"
