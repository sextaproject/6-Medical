#!/usr/bin/env python
"""
Script to verify database connection and check if patients are being saved
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SextaMedical.settings')
django.setup()

from django.db import connection
from ClinicalH.models import Patient

def verify_connection():
    """Verify database connection"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ Database connected successfully!")
            print(f"   PostgreSQL version: {version[0]}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_database_name():
    """Check which database is being used"""
    db_name = connection.settings_dict['NAME']
    db_engine = connection.settings_dict['ENGINE']
    print(f"\n📊 Current Database Configuration:")
    print(f"   Engine: {db_engine}")
    print(f"   Database Name: {db_name}")
    
    if 'postgresql' in db_engine:
        print(f"   ✅ Using PostgreSQL database: {db_name}")
        return True
    else:
        print(f"   ⚠️  Using SQLite (not PostgreSQL!)")
        return False

def check_patients():
    """Check if patients exist in database"""
    try:
        patient_count = Patient.objects.count()
        print(f"\n👥 Patients in database: {patient_count}")
        
        if patient_count > 0:
            print(f"   ✅ Patients are being saved to database!")
            print(f"\n   Recent patients:")
            for p in Patient.objects.all()[:5]:
                print(f"      - {p.nombre} (ID: {p.id}, Room: {p.room})")
        else:
            print(f"   ℹ️  No patients yet. Create one through the web app to test.")
        
        return True
    except Exception as e:
        print(f"❌ Error checking patients: {e}")
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("DATABASE VERIFICATION")
    print("=" * 60)
    
    if not verify_connection():
        sys.exit(1)
    
    is_postgres = check_database_name()
    check_patients()
    
    print("\n" + "=" * 60)
    if is_postgres:
        print("✅ Everything looks good! Patients will be saved to PostgreSQL.")
    else:
        print("⚠️  WARNING: Not using PostgreSQL. Check environment variables.")
    print("=" * 60)
