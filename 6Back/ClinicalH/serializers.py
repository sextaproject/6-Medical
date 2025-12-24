from rest_framework import serializers
from .models import Patient, Medication, MedicalNote, MedicationHistory


class MedicationSerializer(serializers.ModelSerializer):
    """Serializer para el modelo de Medicación"""
    
    class Meta:
        model = Medication
        fields = ['id', 'name', 'dose', 'route', 'freq', 'status', 'created_at', 'updated_at']


class MedicalNoteSerializer(serializers.ModelSerializer):
    """Serializer para el modelo de Notas Médicas"""
    
    class Meta:
        model = MedicalNote
        fields = ['id', 'note_type', 'title', 'content', 'doctor_name', 'created_at', 'updated_at']


class MedicationHistorySerializer(serializers.ModelSerializer):
    """Serializer para el historial de medicación"""
    medication_name = serializers.CharField(source='medication.name', read_only=True)
    
    class Meta:
        model = MedicationHistory
        fields = ['id', 'medication', 'medication_name', 'administered_at', 'administered_by', 'notes']


class PatientListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listado de pacientes"""
    meds_due = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'nombre', 'edad', 'genero', 'cc', 'room', 
            'eps', 'status', 'meds_due', 'fecha_ingreso'
        ]
    
    def get_meds_due(self, obj):
        return obj.medications.filter(status='due').count()


class PatientDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para detalle de paciente"""
    medications = MedicationSerializer(many=True, read_only=True)
    medical_notes = MedicalNoteSerializer(many=True, read_only=True)
    meds_due = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'nombre', 'edad', 'genero', 'cc', 'direccion',
            'eps', 'alergias', 'diagnosticos', 'status',
            'enfermedades_previas', 'cirugias',
            'nombre_acudiente', 'telefono_acudiente',
            'room', 'fecha_ingreso',
            'medications', 'medical_notes', 'meds_due',
            'created_at', 'updated_at'
        ]
    
    def get_meds_due(self, obj):
        return obj.medications.filter(status='due').count()


class PatientCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear/actualizar pacientes"""
    
    class Meta:
        model = Patient
        fields = [
            'nombre', 'edad', 'genero', 'cc', 'direccion',
            'eps', 'alergias', 'diagnosticos', 'status',
            'enfermedades_previas', 'cirugias',
            'nombre_acudiente', 'telefono_acudiente', 'room'
        ]
    
    def create(self, validated_data):
        # Auto-assign room number if not provided
        if not validated_data.get('room'):
            last_patient = Patient.objects.order_by('-id').first()
            next_room = 1 if not last_patient else (int(last_patient.room or 0) + 1)
            validated_data['room'] = str(next_room)
        return super().create(validated_data)

