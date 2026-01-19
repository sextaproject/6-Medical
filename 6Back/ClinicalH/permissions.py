from rest_framework import permissions
from django.utils import timezone
from datetime import timedelta


def is_superuser(user):
    """Check if user is willarevalo (superuser)"""
    return user.username == 'willarevalo' or user.is_superuser


def is_readonly_user(user):
    """Check if user is Colin (read-only)"""
    return user.username == 'Colin'


def is_nurse(user):
    """Check if user is a nurse (not superuser and not readonly)"""
    return not is_superuser(user) and not is_readonly_user(user)


class IsSuperuserOrReadOnly(permissions.BasePermission):
    """
    Permission for SUPERUSER: Full CRUD access
    For others: Read-only
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return is_superuser(request.user)


class CanDeletePatient(permissions.BasePermission):
    """
    Only SUPERUSER (willarevalo) can delete patients.
    Colin (read-only) and Nurses cannot delete patients.
    """
    def has_permission(self, request, view):
        if request.method == 'DELETE':
            return request.user.is_authenticated and is_superuser(request.user)
        return True


class CanCreatePatient(permissions.BasePermission):
    """
    SUPERUSER and Nurses can create patients.
    Colin (read-only) cannot create patients.
    """
    def has_permission(self, request, view):
        if request.method == 'POST' and view.action == 'create':
            return request.user.is_authenticated and (
                is_superuser(request.user) or is_nurse(request.user)
            )
        return True


class CanEditNote(permissions.BasePermission):
    """
    Nurses can edit notes only if:
    1. They created the note
    2. Less than 48 hours have passed
    SUPERUSER can edit any note at any time.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # SUPERUSER can edit anything
        if is_superuser(request.user):
            return True
        
        # Read-only users cannot edit
        if is_readonly_user(request.user):
            return False
        
        # Nurses can only edit their own notes within 48 hours
        if is_nurse(request.user):
            if getattr(obj, 'created_by', None) != request.user:
                return False
            
            if hasattr(obj, 'created_at'):
                time_elapsed = timezone.now() - obj.created_at
                if time_elapsed > timedelta(hours=48):
                    return False
        
        return True


class CanManageMedication(permissions.BasePermission):
    """
    SUPERUSER and Nurses can add/delete medications.
    Colin (read-only) cannot manage medications.
    """
    def has_permission(self, request, view):
        if request.method in ['POST', 'DELETE', 'PUT', 'PATCH']:
            return request.user.is_authenticated and (
                is_superuser(request.user) or is_nurse(request.user)
            )
        return True


class IsAuthorOrReadOnlyAndRecent(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    AND only if the object was created less than 48 hours ago.
    Now uses role-based logic.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        # SUPERUSER can edit anything
        if is_superuser(request.user):
            return True
        
        # Read-only users cannot edit
        if is_readonly_user(request.user):
            return False

        # Nurses can only edit their own notes within 48 hours
        if is_nurse(request.user):
            if getattr(obj, 'created_by', None) != request.user:
                return False

            if hasattr(obj, 'created_at'):
                time_elapsed = timezone.now() - obj.created_at
                if time_elapsed > timedelta(hours=48):
                    return False
        
        return True