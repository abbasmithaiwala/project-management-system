"""
Custom middleware for organization context and multi-tenancy.

This middleware can be extended to automatically inject organization context
into GraphQL queries based on authentication.
"""


class OrganizationContextMiddleware:
    """
    Middleware to add organization context to requests.

    Future enhancements:
    - Extract organization from JWT token
    - Validate organization membership
    - Inject organization into GraphQL context
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Add organization context to request
        # This is a placeholder for future authentication
        request.organization = None

        response = self.get_response(request)
        return response
