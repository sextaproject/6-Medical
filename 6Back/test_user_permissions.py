"""
Test script to verify user permissions for all three user types:
1. SUPERUSER (willarevalo) - Full CRUD access
2. Read-only user (Colin) - Can see everything, cannot modify
3. Nurse (Nurse) - Can create notes, edit within 48h, create patients, manage medications

Run this after setting up users with: python manage.py setup_users
"""
import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SextaMedical.settings')
django.setup()

from django.contrib.auth.models import User
from ClinicalH.models import Patient, MedicalNote, Medication
from ClinicalH.permissions import is_superuser, is_readonly_user, is_nurse
from rest_framework.test import APIClient
from rest_framework import status
import json

def test_user_roles():
    """Test that user role detection works correctly"""
    print("\n" + "="*60)
    print("TESTING USER ROLE DETECTION")
    print("="*60)
    
    # Get users
    try:
        superuser = User.objects.get(username='willarevalo')
        readonly_user = User.objects.get(username='Colin')
        nurse_user = User.objects.get(username='Nurse')
    except User.DoesNotExist as e:
        print(f"❌ ERROR: User not found. Please run: python manage.py setup_users")
        print(f"   Missing user: {e}")
        return False
    
    # Test role detection
    assert is_superuser(superuser), "willarevalo should be detected as superuser"
    assert not is_readonly_user(superuser), "willarevalo should not be readonly"
    assert not is_nurse(superuser), "willarevalo should not be nurse"
    print("✓ willarevalo role detection: PASSED")
    
    assert not is_superuser(readonly_user), "Colin should not be superuser"
    assert is_readonly_user(readonly_user), "Colin should be detected as readonly"
    assert not is_nurse(readonly_user), "Colin should not be nurse"
    print("✓ Colin role detection: PASSED")
    
    assert not is_superuser(nurse_user), "Nurse should not be superuser"
    assert not is_readonly_user(nurse_user), "Nurse should not be readonly"
    assert is_nurse(nurse_user), "Nurse should be detected as nurse"
    print("✓ Nurse role detection: PASSED")
    
    return True


def test_api_permissions():
    """Test API permissions for each user type"""
    print("\n" + "="*60)
    print("TESTING API PERMISSIONS")
    print("="*60)
    
    # Get users
    try:
        superuser = User.objects.get(username='willarevalo')
        readonly_user = User.objects.get(username='Colin')
        nurse_user = User.objects.get(username='Nurse')
    except User.DoesNotExist as e:
        print(f"❌ ERROR: User not found. Please run: python manage.py setup_users")
        return False
    
    # Create a test patient first (as superuser)
    client_super = APIClient()
    client_super.force_authenticate(user=superuser)
    
    # Get or create a test patient
    test_patient_data = {
        'nombre': 'Test Patient',
        'edad': 30,
        'genero': 'Masculino',
        'eps': 'Test EPS',
        'nombre_acudiente': 'Test Contact',
        'telefono_acudiente': '1234567890',
        'room': '999'
    }
    
    response = client_super.post('/api/patients/', test_patient_data, format='json')
    if response.status_code == 201:
        patient_id = response.data['id']
        print(f"✓ Created test patient (ID: {patient_id})")
    elif response.status_code == 400 and 'already exists' in str(response.data).lower():
        # Patient might already exist, try to get it
        response = client_super.get('/api/patients/')
        if response.status_code == 200 and response.data.get('patients'):
            patient_id = response.data['patients'][0]['id']
            print(f"✓ Using existing test patient (ID: {patient_id})")
        else:
            print("❌ Could not create or find test patient")
            return False
    else:
        print(f"❌ Failed to create test patient: {response.status_code}")
        print(f"   Response: {response.data}")
        return False
    
    # Test SUPERUSER permissions
    print("\n--- Testing SUPERUSER (willarevalo) permissions ---")
    client_super = APIClient()
    client_super.force_authenticate(user=superuser)
    
    # Can read patients
    response = client_super.get('/api/patients/')
    assert response.status_code == 200, "Superuser should be able to read patients"
    print("✓ Superuser can READ patients")
    
    # Can create patients
    new_patient = {
        'nombre': 'Superuser Test Patient',
        'edad': 25,
        'genero': 'Femenino',
        'eps': 'Test EPS',
        'nombre_acudiente': 'Test',
        'telefono_acudiente': '123'
    }
    response = client_super.post('/api/patients/', new_patient, format='json')
    assert response.status_code == 201, "Superuser should be able to create patients"
    created_patient_id = response.data['id']
    print("✓ Superuser can CREATE patients")
    
    # Can update patients
    response = client_super.patch(f'/api/patients/{created_patient_id}/', {'edad': 26}, format='json')
    assert response.status_code == 200, "Superuser should be able to update patients"
    print("✓ Superuser can UPDATE patients")
    
    # Can delete patients
    response = client_super.delete(f'/api/patients/{created_patient_id}/')
    assert response.status_code == 204, "Superuser should be able to delete patients"
    print("✓ Superuser can DELETE patients")
    
    # Can create notes
    note_data = {
        'note_type': 'GENERAL',
        'title': 'Test Note',
        'content': 'Test content'
    }
    response = client_super.post(f'/api/patients/{patient_id}/add_note/', note_data, format='json')
    assert response.status_code == 201, "Superuser should be able to create notes"
    note_id = response.data['id']
    print("✓ Superuser can CREATE notes")
    
    # Can add medications
    med_data = {
        'name': 'Test Medication',
        'dose': '100mg',
        'route': 'VO',
        'freq': 'Every 8 hours'
    }
    response = client_super.post(f'/api/patients/{patient_id}/add_medication/', med_data, format='json')
    assert response.status_code == 201, "Superuser should be able to add medications"
    med_id = response.data['id']
    print("✓ Superuser can ADD medications")
    
    # Can delete medications
    response = client_super.delete(f'/api/medications/{med_id}/')
    assert response.status_code == 204, "Superuser should be able to delete medications"
    print("✓ Superuser can DELETE medications")
    
    # Test READ-ONLY USER (Colin) permissions
    print("\n--- Testing READ-ONLY USER (Colin) permissions ---")
    client_readonly = APIClient()
    client_readonly.force_authenticate(user=readonly_user)
    
    # Can read patients
    response = client_readonly.get('/api/patients/')
    assert response.status_code == 200, "Read-only user should be able to read patients"
    print("✓ Read-only user can READ patients")
    
    # Cannot create patients
    response = client_readonly.post('/api/patients/', new_patient, format='json')
    assert response.status_code == 403, "Read-only user should NOT be able to create patients"
    print("✓ Read-only user CANNOT CREATE patients (correctly blocked)")
    
    # Cannot update patients
    response = client_readonly.patch(f'/api/patients/{patient_id}/', {'edad': 31}, format='json')
    assert response.status_code == 403, "Read-only user should NOT be able to update patients"
    print("✓ Read-only user CANNOT UPDATE patients (correctly blocked)")
    
    # Cannot delete patients
    response = client_readonly.delete(f'/api/patients/{patient_id}/')
    assert response.status_code == 403, "Read-only user should NOT be able to delete patients"
    print("✓ Read-only user CANNOT DELETE patients (correctly blocked)")
    
    # Cannot create notes
    response = client_readonly.post(f'/api/patients/{patient_id}/add_note/', note_data, format='json')
    assert response.status_code == 403, "Read-only user should NOT be able to create notes"
    print("✓ Read-only user CANNOT CREATE notes (correctly blocked)")
    
    # Cannot add medications
    response = client_readonly.post(f'/api/patients/{patient_id}/add_medication/', med_data, format='json')
    assert response.status_code == 403, "Read-only user should NOT be able to add medications"
    print("✓ Read-only user CANNOT ADD medications (correctly blocked)")
    
    # Test NURSE permissions
    print("\n--- Testing NURSE permissions ---")
    client_nurse = APIClient()
    client_nurse.force_authenticate(user=nurse_user)
    
    # Can read patients
    response = client_nurse.get('/api/patients/')
    assert response.status_code == 200, "Nurse should be able to read patients"
    print("✓ Nurse can READ patients")
    
    # Can create patients
    nurse_patient = {
        'nombre': 'Nurse Test Patient',
        'edad': 28,
        'genero': 'Masculino',
        'eps': 'Test EPS',
        'nombre_acudiente': 'Test',
        'telefono_acudiente': '123'
    }
    response = client_nurse.post('/api/patients/', nurse_patient, format='json')
    assert response.status_code == 201, "Nurse should be able to create patients"
    nurse_patient_id = response.data['id']
    print("✓ Nurse can CREATE patients")
    
    # Cannot update patients (only superuser can)
    response = client_nurse.patch(f'/api/patients/{nurse_patient_id}/', {'edad': 29}, format='json')
    assert response.status_code == 403, "Nurse should NOT be able to update patients"
    print("✓ Nurse CANNOT UPDATE patients (correctly blocked)")
    
    # Cannot delete patients
    response = client_nurse.delete(f'/api/patients/{nurse_patient_id}/')
    assert response.status_code == 403, "Nurse should NOT be able to delete patients"
    print("✓ Nurse CANNOT DELETE patients (correctly blocked)")
    
    # Can create notes
    nurse_note = {
        'note_type': 'GENERAL',
        'title': 'Nurse Test Note',
        'content': 'Nurse test content'
    }
    response = client_nurse.post(f'/api/patients/{patient_id}/add_note/', nurse_note, format='json')
    assert response.status_code == 201, "Nurse should be able to create notes"
    nurse_note_id = response.data['id']
    print("✓ Nurse can CREATE notes")
    
    # Can add medications
    nurse_med = {
        'name': 'Nurse Medication',
        'dose': '50mg',
        'route': 'VO',
        'freq': 'Every 12 hours'
    }
    response = client_nurse.post(f'/api/patients/{patient_id}/add_medication/', nurse_med, format='json')
    assert response.status_code == 201, "Nurse should be able to add medications"
    nurse_med_id = response.data['id']
    print("✓ Nurse can ADD medications")
    
    # Can delete medications
    response = client_nurse.delete(f'/api/medications/{nurse_med_id}/')
    assert response.status_code == 204, "Nurse should be able to delete medications"
    print("✓ Nurse can DELETE medications")
    
    # Can edit own notes (within 48h) - tested via note update endpoint
    response = client_nurse.patch(f'/api/notes/{nurse_note_id}/', {'content': 'Updated content'}, format='json')
    assert response.status_code == 200, "Nurse should be able to edit own notes within 48h"
    print("✓ Nurse can EDIT own notes (within 48h)")
    
    # Cleanup: Delete test patient created by nurse (as superuser)
    client_super.delete(f'/api/patients/{nurse_patient_id}/')
    
    print("\n" + "="*60)
    print("✅ ALL TESTS PASSED!")
    print("="*60)
    return True


if __name__ == '__main__':
    print("\n🧪 Starting User Permissions Test Suite...")
    print("="*60)
    
    if not test_user_roles():
        sys.exit(1)
    
    if not test_api_permissions():
        sys.exit(1)
    
    print("\n✅ All tests completed successfully!")
    print("\nUser Summary:")
    print("  - SUPERUSER (willarevalo): Full CRUD access ✓")
    print("  - Read-only (Colin): Read-only access ✓")
    print("  - Nurse (Nurse): Can create notes/patients/medications, edit notes within 48h ✓")
