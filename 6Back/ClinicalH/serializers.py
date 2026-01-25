from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.utils import timezone
from datetime import timedelta
from .models import Patient, Medication, MedicalNote, MedicationHistory, NoteEditHistory
import re


class MedicationSerializer(serializers.ModelSerializer):
    """Serializer para el modelo de Medicación con validación"""
    
    class Meta:
        model = Medication
        fields = ['id', 'name', 'dose', 'route', 'freq', 'status', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        """Validar que el nombre del medicamento no esté vacío"""
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre del medicamento es requerido.")
        return value.strip()
    
    def validate_dose(self, value):
        """Validar que la dosis no esté vacía"""
        if not value or not value.strip():
            raise serializers.ValidationError("La dosis es requerida.")
        return value.strip()
    
    def validate_freq(self, value):
        """Validar que la frecuencia no esté vacía"""
        if not value or not value.strip():
            raise serializers.ValidationError("La frecuencia es requerida.")
        return value.strip()

class NoteEditHistorySerializer(serializers.ModelSerializer):
    """Serializer for note edit history"""
    edited_by_username = serializers.CharField(source='edited_by.username', read_only=True)
    
    class Meta:
        model = NoteEditHistory
        fields = [
            'id', 'edited_by_username', 'edited_at', 
            'previous_title', 'new_title', 'previous_content', 'new_content'
        ]


class MedicalNoteSerializer(serializers.ModelSerializer):
    created_by_id = serializers.IntegerField(source='created_by.id', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    edit_history = NoteEditHistorySerializer(many=True, read_only=True)
    evidence_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicalNote
        fields = [
            'id', 'note_type', 'title', 'content', 
            'doctor_name', 'created_by_id', 'created_by_username',
            'evidence_photo', 'evidence_photo_url',
            'created_at', 'updated_at', 'edit_history'
        ]
        extra_kwargs = {
            'evidence_photo': {'write_only': True, 'required': False}
        }
    
    def get_evidence_photo_url(self, obj):
        """Return the full URL for the evidence photo if it exists"""
        if obj.evidence_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.evidence_photo.url)
            return obj.evidence_photo.url
        return None
    
    def validate_content(self, value):
        """Validar que el contenido no exceda 2000 palabras"""
        if value:
            word_count = len(value.split())
            if word_count > 2000:
                raise serializers.ValidationError(
                    f"El contenido no puede exceder 2000 palabras. Actualmente tiene {word_count} palabras."
                )
        return value

class MedicationHistorySerializer(serializers.ModelSerializer):
    medication_name = serializers.CharField(source='medication.name', read_only=True)
    
    class Meta:
        model = MedicationHistory
        fields = ['id', 'medication', 'medication_name', 'administered_at', 'administered_by', 'notes']


class PatientListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listado de pacientes"""
    meds_due = serializers.SerializerMethodField()
    evolution_done = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'nombre', 'fecha_nacimiento', 'edad', 'genero', 'cc', 'room', 
            'eps', 'status', 'meds_due', 'fecha_ingreso', 'evolution_done'
        ]
    
    def get_meds_due(self, obj):
        return obj.medications.filter(status='due').count()
    
    def get_evolution_done(self, obj):
        """
        Check if patient has a clinical evolution note for the current shift.
        Day Shift: 7:00 AM - 7:00 PM
        Night Shift: 7:00 PM - 7:00 AM (next day)
        """
        now = timezone.localtime(timezone.now())
        current_hour = now.hour
        
        # Calculate the start of the current shift
        if 7 <= current_hour < 19:
            # Day Shift (7am to 7pm)
            shift_start = now.replace(hour=7, minute=0, second=0, microsecond=0)
        else:
            # Night Shift (7pm to 7am)
            if current_hour >= 19:
                # Example: 10 PM. Shift started today at 7 PM.
                shift_start = now.replace(hour=19, minute=0, second=0, microsecond=0)
            else:
                # Example: 3 AM. Shift started yesterday at 7 PM.
                shift_start = (now - timedelta(days=1)).replace(hour=19, minute=0, second=0, microsecond=0)
        
        # Check if a note exists since the shift started
        # We consider VITALS, EVOLUTION, and GENERAL notes as valid evolution notes
        return obj.medical_notes.filter(
            created_at__gte=shift_start,
            note_type__in=['VITALS', 'EVOLUTION', 'GENERAL']
        ).exists()


class PatientDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para detalle de paciente"""
    medications = MedicationSerializer(many=True, read_only=True)
    medical_notes = MedicalNoteSerializer(many=True, read_only=True)
    meds_due = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'nombre', 'fecha_nacimiento', 'edad', 'genero', 'cc', 'direccion',
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
    """Serializer para crear/actualizar pacientes con validación"""
    
    # Validación de edad (0-150 años) - ahora opcional si hay fecha_nacimiento
    edad = serializers.IntegerField(
        required=False,
        allow_null=True,
        validators=[MinValueValidator(0), MaxValueValidator(150)],
        error_messages={
            'min_value': 'La edad debe ser mayor o igual a 0.',
            'max_value': 'La edad debe ser menor o igual a 150.',
            'invalid': 'La edad debe ser un número entero.'
        }
    )
    
    # Validación de CC (cédula de ciudadanía) - único y requerido
    cc = serializers.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^[0-9]{7,20}$',
                message='La cédula debe contener solo números (7-20 dígitos).'
            )
        ],
        error_messages={
            'unique': 'Esta cédula de ciudadanía ya está registrada.',
            'required': 'La cédula de ciudadanía es requerida.'
        }
    )
    
    # Validación de teléfono (solo números, 7-15 dígitos)
    telefono_acudiente = serializers.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^[0-9]{7,15}$',
                message='El teléfono debe contener solo números (7-15 dígitos).'
            )
        ]
    )
    
    class Meta:
        model = Patient
        fields = [
            'id', 'nombre', 'fecha_nacimiento', 'edad', 'genero', 'cc', 'direccion',
            'eps', 'alergias', 'diagnosticos', 'status',
            'enfermedades_previas', 'cirugias',
            'nombre_acudiente', 'telefono_acudiente', 'room'
        ]
        read_only_fields = ['id']
    
    def validate_nombre(self, value):
        """Validar que el nombre no esté vacío"""
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre completo es requerido.")
        return value.strip()
    
    def validate_eps(self, value):
        """Validar que EPS no esté vacío"""
        if not value or not value.strip():
            raise serializers.ValidationError("La EPS es requerida.")
        return value.strip()
    
    def validate_nombre_acudiente(self, value):
        """Validar que el nombre del acudiente no esté vacío"""
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre del acudiente es requerido.")
        return value.strip()
    
    def validate(self, data):
        """Validación cruzada: fecha_nacimiento o edad debe estar presente"""
        from datetime import date
        
        fecha_nacimiento = data.get('fecha_nacimiento')
        edad = data.get('edad')
        
        if not fecha_nacimiento and not edad:
            raise serializers.ValidationError({
                'fecha_nacimiento': 'Debe proporcionar fecha de nacimiento o edad.',
                'edad': 'Debe proporcionar fecha de nacimiento o edad.'
            })
        
        # Auto-calculate age from fecha_nacimiento if provided
        if fecha_nacimiento and not edad:
            today = date.today()
            calculated_age = today.year - fecha_nacimiento.year - ((today.month, today.day) < (fecha_nacimiento.month, fecha_nacimiento.day))
            data['edad'] = calculated_age
        
        return data
    
    def create(self, validated_data):
        if not validated_data.get('room'):
            last_patient = Patient.objects.order_by('-id').first()
            next_room = 1 if not last_patient else (int(last_patient.room or 0) + 1)
            validated_data['room'] = str(next_room)
        return super().create(validated_data)
