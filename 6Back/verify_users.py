#!/usr/bin/env python3
"""
Script to verify users exist and can authenticate.
Run this before testing the API.

Usage:
    python verify_users.py
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SextaMedical.settings')
django.setup()

from django.contrib.auth.models import User

def verify_user(username, password, expected_role):
    """Verify a user exists and can authenticate"""
    try:
        user = User.objects.get(username=username)
        print(f"✓ User '{username}' exists")
        
        # Check password
        if user.check_password(password):
            print(f"  ✓ Password is correct")
        else:
            print(f"  ✗ Password is INCORRECT!")
            return False
        
        # Check role
        is_super = user.is_superuser or user.username == 'willarevalo'
        is_readonly = user.username == 'Colin'
        is_nurse = not is_super and not is_readonly
        
        role_match = False
        if expected_role == 'superuser' and is_super:
            role_match = True
        elif expected_role == 'readonly' and is_readonly:
            role_match = True
        elif expected_role == 'nurse' and is_nurse:
            role_match = True
        
        if role_match:
            print(f"  ✓ Role matches expected: {expected_role}")
        else:
            print(f"  ⚠ Role mismatch. Expected: {expected_role}, Actual: superuser={is_super}, readonly={is_readonly}, nurse={is_nurse}")
        
        return True
    except User.DoesNotExist:
        print(f"✗ User '{username}' does NOT exist!")
        print(f"  Run: python manage.py setup_users")
        return False
    except Exception as e:
        print(f"✗ Error checking user '{username}': {e}")
        return False

def main():
    print("="*60)
    print("USER VERIFICATION")
    print("="*60)
    print()
    
    users_to_check = [
        ("willarevalo", "willarevalo123", "superuser"),
        ("Colin", "Esperanza2026", "readonly"),
        ("Nurse", "nurse", "nurse"),
    ]
    
    all_ok = True
    for username, password, role in users_to_check:
        print(f"\nChecking user: {username}")
        if not verify_user(username, password, role):
            all_ok = False
        print()
    
    print("="*60)
    if all_ok:
        print("✓ All users verified!")
        print("\nYou can now test authentication with:")
        print("  python test_auth.py")
        return 0
    else:
        print("✗ Some users are missing or incorrect!")
        print("\nTo fix, run:")
        print("  python manage.py setup_users")
        return 1

if __name__ == "__main__":
    sys.exit(main())
