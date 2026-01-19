#!/usr/bin/env python3
"""
Comprehensive test runner for the Clinical Health application.
This script runs all tests and generates a complete report.

Usage:
    python run_all_tests.py
"""

import os
import sys
import subprocess
import django
from pathlib import Path

# Setup Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SextaMedical.settings')
django.setup()

from django.contrib.auth.models import User
from ClinicalH.models import Patient, MedicalNote, Medication, NoteEditHistory
from datetime import datetime, timedelta
from django.utils import timezone

class TestRunner:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
        
    def log(self, test_name, passed, message=""):
        status = "✓ PASS" if passed else "✗ FAIL"
        self.results.append({
            'test': test_name,
            'passed': passed,
            'message': message,
            'status': status
        })
        if passed:
            self.passed += 1
            print(f"✓ {test_name}: PASS")
        else:
            self.failed += 1
            print(f"✗ {test_name}: FAIL - {message}")
    
    def test_users_exist(self):
        """Test that all required users exist"""
        print("\n" + "="*60)
        print("TEST: User Existence")
        print("="*60)
        
        users_to_check = [
            ('willarevalo', 'willarevalo123', True),
            ('Colin', 'Esperanza2026', False),
            ('Nurse', 'nurse', False),
        ]
        
        all_exist = True
        for username, password, is_super in users_to_check:
            try:
                user = User.objects.get(username=username)
                password_ok = user.check_password(password)
                super_ok = user.is_superuser == is_super if username == 'willarevalo' else True
                
                if password_ok and super_ok:
                    self.log(f"User '{username}' exists and password is correct", True)
                else:
                    self.log(f"User '{username}' exists but password or role is incorrect", False)
                    all_exist = False
            except User.DoesNotExist:
                self.log(f"User '{username}' does not exist", False)
                all_exist = False
        
        return all_exist
    
    def test_models_exist(self):
        """Test that all models are properly defined"""
        print("\n" + "="*60)
        print("TEST: Model Definitions")
        print("="*60)
        
        models_to_check = [
            ('Patient', Patient),
            ('MedicalNote', MedicalNote),
            ('Medication', Medication),
            ('NoteEditHistory', NoteEditHistory),
        ]
        
        all_exist = True
        for name, model in models_to_check:
            try:
                count = model.objects.count()
                self.log(f"Model '{name}' exists (count: {count})", True)
            except Exception as e:
                self.log(f"Model '{name}' has errors", False, str(e))
                all_exist = False
        
        return all_exist
    
    def test_permissions(self):
        """Test permission functions"""
        print("\n" + "="*60)
        print("TEST: Permission Functions")
        print("="*60)
        
        from ClinicalH.permissions import is_superuser, is_readonly_user, is_nurse
        
        try:
            superuser = User.objects.get(username='willarevalo')
            readonly = User.objects.get(username='Colin')
            nurse = User.objects.get(username='Nurse')
            
            # Test superuser detection
            result = is_superuser(superuser)
            self.log("is_superuser() correctly identifies superuser", result)
            
            # Test readonly detection
            result = is_readonly_user(readonly)
            self.log("is_readonly_user() correctly identifies readonly user", result)
            
            # Test nurse detection
            result = is_nurse(nurse)
            self.log("is_nurse() correctly identifies nurse", result)
            
            # Test negative cases
            result = not is_superuser(readonly)
            self.log("is_superuser() correctly rejects readonly user", result)
            
            result = not is_readonly_user(nurse)
            self.log("is_readonly_user() correctly rejects nurse", result)
            
            return True
        except Exception as e:
            self.log("Permission functions test", False, str(e))
            return False
    
    def test_note_edit_history(self):
        """Test note edit history functionality"""
        print("\n" + "="*60)
        print("TEST: Note Edit History")
        print("="*60)
        
        try:
            # Create a test patient if none exists
            patient, _ = Patient.objects.get_or_create(
                nombre="Test Patient for History",
                defaults={
                    'edad': 30,
                    'genero': 'Masculino',
                    'eps': 'Test EPS',
                    'nombre_acudiente': 'Test',
                    'telefono_acudiente': '123'
                }
            )
            
            # Create a test note
            nurse = User.objects.get(username='Nurse')
            note = MedicalNote.objects.create(
                patient=patient,
                created_by=nurse,
                title="Original Title",
                content="Original Content",
                doctor_name="Nurse"
            )
            
            # Edit the note (this should create history)
            note.title = "Edited Title"
            note.content = "Edited Content"
            note.save()
            
            # Manually create edit history (since we're testing the model)
            history = NoteEditHistory.objects.create(
                note=note,
                edited_by=nurse,
                previous_title="Original Title",
                new_title="Edited Title",
                previous_content="Original Content",
                new_content="Edited Content"
            )
            
            # Verify history exists
            history_count = NoteEditHistory.objects.filter(note=note).count()
            self.log("NoteEditHistory model works correctly", history_count > 0)
            
            # Clean up
            note.delete()
            patient.delete()
            
            return True
        except Exception as e:
            self.log("Note edit history test", False, str(e))
            return False
    
    def test_48_hour_window(self):
        """Test 48-hour edit window logic"""
        print("\n" + "="*60)
        print("TEST: 48-Hour Edit Window")
        print("="*60)
        
        try:
            from ClinicalH.permissions import CanEditNote
            from django.utils import timezone
            from datetime import timedelta
            
            # Create test patient and note
            patient, _ = Patient.objects.get_or_create(
                nombre="Test Patient 48h",
                defaults={
                    'edad': 30,
                    'genero': 'Masculino',
                    'eps': 'Test EPS',
                    'nombre_acudiente': 'Test',
                    'telefono_acudiente': '123'
                }
            )
            
            nurse = User.objects.get(username='Nurse')
            
            # Create note with recent timestamp (within 48h)
            recent_note = MedicalNote.objects.create(
                patient=patient,
                created_by=nurse,
                title="Recent Note",
                content="Content",
                doctor_name="Nurse",
                created_at=timezone.now() - timedelta(hours=24)  # 24 hours ago
            )
            
            # Create note with old timestamp (beyond 48h)
            old_note = MedicalNote.objects.create(
                patient=patient,
                created_by=nurse,
                title="Old Note",
                content="Content",
                doctor_name="Nurse",
                created_at=timezone.now() - timedelta(hours=49)  # 49 hours ago
            )
            
            # Test permission class
            permission = CanEditNote()
            
            # Mock request object
            class MockRequest:
                def __init__(self, user, method='PUT'):
                    self.user = user
                    self.method = method
            
            request = MockRequest(nurse, 'PUT')
            
            # Recent note should be editable
            recent_editable = permission.has_object_permission(request, None, recent_note)
            self.log("Nurse can edit note within 48 hours", recent_editable)
            
            # Old note should not be editable by nurse
            old_editable = permission.has_object_permission(request, None, old_note)
            self.log("Nurse cannot edit note after 48 hours", not old_editable)
            
            # Clean up
            recent_note.delete()
            old_note.delete()
            patient.delete()
            
            return True
        except Exception as e:
            self.log("48-hour window test", False, str(e))
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("\n" + "="*70)
        print("CLINICAL HEALTH APPLICATION - COMPREHENSIVE TEST SUITE")
        print("="*70)
        print(f"Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*70)
        
        # Run all test suites
        self.test_users_exist()
        self.test_models_exist()
        self.test_permissions()
        self.test_note_edit_history()
        self.test_48_hour_window()
        
        # Print summary
        print("\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)
        print(f"Total Tests: {len(self.results)}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed/len(self.results)*100):.1f}%")
        print("="*70)
        
        # Print detailed results
        print("\nDetailed Results:")
        for result in self.results:
            status_color = "\033[92m" if result['passed'] else "\033[91m"
            print(f"{status_color}{result['status']}\033[0m - {result['test']}")
            if result['message']:
                print(f"    {result['message']}")
        
        return self.failed == 0

if __name__ == "__main__":
    runner = TestRunner()
    success = runner.run_all_tests()
    sys.exit(0 if success else 1)
