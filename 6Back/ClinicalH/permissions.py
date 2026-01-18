from rest_framework import permissions
from django.utils import timezone
from datetime import timedelta

class IsAuthorOrReadOnlyAndRecent(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    AND only if the object was created less than 48 hours ago.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if getattr(obj, 'created_by', None) != request.user:
            return False

        if hasattr(obj, 'created_at'):
            time_elapsed = timezone.now() - obj.created_at
            if time_elapsed > timedelta(hours=48):
                return False # Too late to edit
        
        return True