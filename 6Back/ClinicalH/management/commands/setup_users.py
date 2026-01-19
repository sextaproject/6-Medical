"""
Management command to set up initial users for the Clinical Health application.

Usage:
    python manage.py setup_users

This command creates:
    1. SUPERUSER: willarevalo (full CRUD access)
    2. Read-only user: Colin (password: Esperanza2026)
    3. Test Nurse: Nurse (password: nurse)
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Set up initial users for the Clinical Health application'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up users...'))
        
        # 1. Create/Update SUPERUSER: willarevalo
        username_superuser = 'willarevalo'
        if User.objects.filter(username=username_superuser).exists():
            superuser = User.objects.get(username=username_superuser)
            self.stdout.write(self.style.WARNING(f'User "{username_superuser}" already exists. Updating...'))
        else:
            superuser = User.objects.create_user(
                username=username_superuser,
                email='willarevalo@example.com',
                password='willarevalo123'  # Change this password in production!
            )
            self.stdout.write(self.style.SUCCESS(f'Created user "{username_superuser}"'))
        
        superuser.is_superuser = True
        superuser.is_staff = True
        superuser.save()
        self.stdout.write(self.style.SUCCESS(f'✓ SUPERUSER "{username_superuser}" configured (full CRUD access)'))
        
        # 2. Create Read-only user: Colin
        username_readonly = 'Colin'
        password_readonly = 'Esperanza2026'
        
        if User.objects.filter(username=username_readonly).exists():
            readonly_user = User.objects.get(username=username_readonly)
            readonly_user.set_password(password_readonly)
            readonly_user.save()
            self.stdout.write(self.style.WARNING(f'User "{username_readonly}" already exists. Password updated.'))
        else:
            readonly_user = User.objects.create_user(
                username=username_readonly,
                email='colin@example.com',
                password=password_readonly
            )
            self.stdout.write(self.style.SUCCESS(f'Created user "{username_readonly}"'))
        
        readonly_user.is_superuser = False
        readonly_user.is_staff = False
        readonly_user.save()
        self.stdout.write(self.style.SUCCESS(f'✓ Read-only user "{username_readonly}" configured (can see everything, cannot modify)'))
        
        # 3. Create Test Nurse user
        username_nurse = 'Nurse'
        password_nurse = 'nurse'
        
        if User.objects.filter(username=username_nurse).exists():
            nurse_user = User.objects.get(username=username_nurse)
            nurse_user.set_password(password_nurse)
            nurse_user.save()
            self.stdout.write(self.style.WARNING(f'User "{username_nurse}" already exists. Password updated.'))
        else:
            nurse_user = User.objects.create_user(
                username=username_nurse,
                email='nurse@example.com',
                password=password_nurse
            )
            self.stdout.write(self.style.SUCCESS(f'Created user "{username_nurse}"'))
        
        nurse_user.is_superuser = False
        nurse_user.is_staff = False
        nurse_user.save()
        self.stdout.write(self.style.SUCCESS(f'✓ Nurse user "{username_nurse}" configured (can create notes, edit within 48h, create patients, manage medications)'))
        
        self.stdout.write(self.style.SUCCESS('\n✓ All users set up successfully!'))
        self.stdout.write(self.style.WARNING('\nIMPORTANT: Change the default password for willarevalo in production!'))
