"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView

urlpatterns = [
    path('admin/', admin.site.urls),
    # GraphQL endpoint with GraphiQL interface (both with and without trailing slash)
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
    path('graphql', csrf_exempt(GraphQLView.as_view(graphiql=True))),
]
