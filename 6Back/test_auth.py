#!/usr/bin/env python3
"""
Comprehensive authentication and permissions test script.
Run this to verify all user roles and permissions work correctly.

Usage:
    python test_auth.py
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def print_header(message):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

def get_token(username, password):
    """Get JWT token for a user"""
    try:
        response = requests.post(
            f"{BASE_URL}/token/",
            json={"username": username, "password": password},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access"), data.get("refresh")
        else:
            print_error(f"Failed to get token for {username}: {response.status_code}")
            print_error(f"Response: {response.text}")
            return None, None
    except requests.exceptions.ConnectionError:
        print_error(f"Cannot connect to {BASE_URL}. Is the Django server running?")
        sys.exit(1)
    except Exception as e:
        print_error(f"Error getting token: {e}")
        return None, None

def test_endpoint(method, url, token=None, data=None, expected_status=200, description=""):
    """Test an API endpoint"""
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=5)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=5)
        else:
            return False, f"Unknown method: {method}"
        
        success = response.status_code == expected_status
        if success:
            print_success(f"{description or f'{method} {url}'}: {response.status_code}")
        else:
            print_error(f"{description or f'{method} {url}'}: Expected {expected_status}, got {response.status_code}")
            if response.text:
                try:
                    error_data = response.json()
                    print_error(f"  Error: {error_data}")
                except:
                    print_error(f"  Response: {response.text[:200]}")
        return success, response
    except Exception as e:
        print_error(f"{description or f'{method} {url}'}: Exception - {e}")
        return False, None

def test_superuser():
    """Test SUPERUSER (willarevalo) permissions"""
    print_header("TEST 1: SUPERUSER (willarevalo) - Full Access")
    
    token, refresh = get_token("willarevalo", "willarevalo123")
    if not token:
        print_error("Failed to authenticate as superuser")
        return False
    
    print_success("Authenticated as willarevalo")
    
    # Test CREATE Patient
    patient_data = {
        "nombre": "Test Patient Superuser",
        "edad": 45,
        "genero": "Masculino",
        "eps": "Test EPS",
        "nombre_acudiente": "Test Contact",
        "telefono_acudiente": "1234567890"
    }
    success, response = test_endpoint(
        "POST", f"{BASE_URL}/patients/", token, patient_data, 
        expected_status=201, description="CREATE Patient"
    )
    if not success:
        return False
    
    patient_id = response.json().get("id") if response else None
    
    # Test LIST Patients
    success, _ = test_endpoint(
        "GET", f"{BASE_URL}/patients/", token,
        expected_status=200, description="LIST Patients"
    )
    if not success:
        return False
    
    # Test UPDATE Patient (if we have a patient)
    if patient_id:
        update_data = patient_data.copy()
        update_data["nombre"] = "Updated Patient Name"
        success, _ = test_endpoint(
            "PUT", f"{BASE_URL}/patients/{patient_id}/", token, update_data,
            expected_status=200, description="UPDATE Patient"
        )
        if not success:
            return False
    
    # Test CREATE Note
    if patient_id:
        note_data = {
            "title": "Superuser Note",
            "content": "Created by superuser",
            "type": "GENERAL"
        }
        success, note_response = test_endpoint(
            "POST", f"{BASE_URL}/patients/{patient_id}/add_note/", token, note_data,
            expected_status=201, description="CREATE Note"
        )
        if success and note_response:
            note_id = note_response.json().get("id")
            
            # Test UPDATE Note
            update_note_data = {
                "title": "Updated Superuser Note",
                "content": "Updated by superuser",
                "note_type": "GENERAL"
            }
            test_endpoint(
                "PUT", f"{BASE_URL}/notes/{note_id}/", token, update_note_data,
                expected_status=200, description="UPDATE Note"
            )
    
    # Test ADD Medication
    if patient_id:
        med_data = {
            "name": "Aspirin",
            "dose": "100mg",
            "route": "VO",
            "freq": "Every 8 hours"
        }
        success, med_response = test_endpoint(
            "POST", f"{BASE_URL}/patients/{patient_id}/add_medication/", token, med_data,
            expected_status=201, description="ADD Medication"
        )
        if success and med_response:
            med_id = med_response.json().get("id")
            # Test DELETE Medication
            test_endpoint(
                "DELETE", f"{BASE_URL}/medications/{med_id}/", token,
                expected_status=204, description="DELETE Medication"
            )
    
    print_success("All SUPERUSER tests passed!")
    return True

def test_readonly_user():
    """Test Read-only user (Colin) permissions"""
    print_header("TEST 2: Read-Only User (Colin) - View Only")
    
    token, refresh = get_token("Colin", "Esperanza2026")
    if not token:
        print_error("Failed to authenticate as Colin")
        return False
    
    print_success("Authenticated as Colin")
    
    # Test LIST Patients (should succeed)
    success, _ = test_endpoint(
        "GET", f"{BASE_URL}/patients/", token,
        expected_status=200, description="LIST Patients (READ)"
    )
    if not success:
        return False
    
    # Test GET Patient Details (should succeed)
    # First get a patient ID
    response = requests.get(f"{BASE_URL}/patients/", headers={"Authorization": f"Bearer {token}"})
    if response.status_code == 200:
        patients = response.json().get("patients", [])
        if patients:
            patient_id = patients[0].get("id")
            success, _ = test_endpoint(
                "GET", f"{BASE_URL}/patients/{patient_id}/", token,
                expected_status=200, description="GET Patient Details (READ)"
            )
    
    # Test CREATE Patient (should FAIL)
    patient_data = {
        "nombre": "Test Patient Colin",
        "edad": 30,
        "genero": "Femenino",
        "eps": "Test EPS",
        "nombre_acudiente": "Test",
        "telefono_acudiente": "123"
    }
    success, _ = test_endpoint(
        "POST", f"{BASE_URL}/patients/", token, patient_data,
        expected_status=403, description="CREATE Patient (SHOULD FAIL)"
    )
    if success:
        print_success("Correctly blocked CREATE Patient")
    
    # Test CREATE Note (should FAIL)
    if patients:
        patient_id = patients[0].get("id")
        note_data = {"title": "Test", "content": "Test"}
        success, _ = test_endpoint(
            "POST", f"{BASE_URL}/patients/{patient_id}/add_note/", token, note_data,
            expected_status=403, description="CREATE Note (SHOULD FAIL)"
        )
        if success:
            print_success("Correctly blocked CREATE Note")
    
    # Test ADD Medication (should FAIL)
    if patients:
        med_data = {"name": "Test Med", "dose": "100mg", "route": "VO", "freq": "Daily"}
        success, _ = test_endpoint(
            "POST", f"{BASE_URL}/patients/{patient_id}/add_medication/", token, med_data,
            expected_status=403, description="ADD Medication (SHOULD FAIL)"
        )
        if success:
            print_success("Correctly blocked ADD Medication")
    
    print_success("All Read-Only user tests passed!")
    return True

def test_nurse():
    """Test Nurse user permissions"""
    print_header("TEST 3: Nurse User - Limited Write Access")
    
    token, refresh = get_token("Nurse", "nurse")
    if not token:
        print_error("Failed to authenticate as Nurse")
        return False
    
    print_success("Authenticated as Nurse")
    
    # Test CREATE Patient (should succeed)
    patient_data = {
        "nombre": "Patient Created by Nurse",
        "edad": 35,
        "genero": "Femenino",
        "eps": "Test EPS",
        "nombre_acudiente": "Contact",
        "telefono_acudiente": "1234567890"
    }
    success, response = test_endpoint(
        "POST", f"{BASE_URL}/patients/", token, patient_data,
        expected_status=201, description="CREATE Patient"
    )
    if not success:
        return False
    
    patient_id = response.json().get("id") if response else None
    
    # Test UPDATE Patient (should FAIL - only superuser can update)
    if patient_id:
        update_data = patient_data.copy()
        update_data["nombre"] = "Updated"
        success, _ = test_endpoint(
            "PUT", f"{BASE_URL}/patients/{patient_id}/", token, update_data,
            expected_status=403, description="UPDATE Patient (SHOULD FAIL)"
        )
        if success:
            print_success("Correctly blocked UPDATE Patient")
    
    # Test DELETE Patient (should FAIL - nurses cannot delete)
    if patient_id:
        success, _ = test_endpoint(
            "DELETE", f"{BASE_URL}/patients/{patient_id}/", token,
            expected_status=403, description="DELETE Patient (SHOULD FAIL)"
        )
        if success:
            print_success("Correctly blocked DELETE Patient")
    
    # Test CREATE Note (should succeed)
    if patient_id:
        note_data = {
            "title": "Nurse Note",
            "content": "Created by nurse",
            "type": "GENERAL"
        }
        success, note_response = test_endpoint(
            "POST", f"{BASE_URL}/patients/{patient_id}/add_note/", token, note_data,
            expected_status=201, description="CREATE Note"
        )
        if success and note_response:
            note_id = note_response.json().get("id")
            
            # Test UPDATE Own Note (should succeed)
            update_note_data = {
                "title": "Updated Nurse Note",
                "content": "Updated by nurse",
                "note_type": "GENERAL"
            }
            test_endpoint(
                "PUT", f"{BASE_URL}/notes/{note_id}/", token, update_note_data,
                expected_status=200, description="UPDATE Own Note"
            )
    
    # Test ADD Medication (should succeed)
    if patient_id:
        med_data = {
            "name": "Paracetamol",
            "dose": "500mg",
            "route": "VO",
            "freq": "Every 6 hours"
        }
        success, med_response = test_endpoint(
            "POST", f"{BASE_URL}/patients/{patient_id}/add_medication/", token, med_data,
            expected_status=201, description="ADD Medication"
        )
        if success and med_response:
            med_id = med_response.json().get("id")
            # Test DELETE Medication (should succeed)
            test_endpoint(
                "DELETE", f"{BASE_URL}/medications/{med_id}/", token,
                expected_status=204, description="DELETE Medication"
            )
    
    print_success("All Nurse user tests passed!")
    return True

def test_unauthenticated():
    """Test unauthenticated access (should fail)"""
    print_header("TEST 4: Unauthenticated Access (Should Fail)")
    
    success, _ = test_endpoint(
        "GET", f"{BASE_URL}/patients/", token=None,
        expected_status=401, description="Access without token (SHOULD FAIL)"
    )
    if success:
        print_success("Correctly blocked unauthenticated access")
        return True
    return False

def main():
    """Run all tests"""
    print_header("AUTHENTICATION & PERMISSIONS TEST SUITE")
    print_info(f"Testing against: {BASE_URL}")
    print_info(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    results = []
    
    # Test unauthenticated access
    results.append(("Unauthenticated", test_unauthenticated()))
    
    # Test superuser
    results.append(("Superuser", test_superuser()))
    
    # Test readonly user
    results.append(("Read-Only User", test_readonly_user()))
    
    # Test nurse
    results.append(("Nurse", test_nurse()))
    
    # Summary
    print_header("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "PASSED" if result else "FAILED"
        color = Colors.GREEN if result else Colors.RED
        print(f"{color}{'✓' if result else '✗'} {name}: {status}{Colors.END}")
    
    print(f"\n{Colors.BOLD}Total: {passed}/{total} test suites passed{Colors.END}")
    
    if passed == total:
        print_success("\n🎉 All tests passed! Authentication system is working correctly.")
        return 0
    else:
        print_error(f"\n⚠️  {total - passed} test suite(s) failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
