from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Patient(models.Model):    
    GENDER_CHOICES = [
        ('Masculino', 'Masculino'),
        ('Femenino', 'Femenino'),
    ]
    
    STATUS_CHOICES = [
        ('Estable', 'Estable'),
        ('En observación', 'En observación'),
        ('Alta', 'Alta'),
    ]
    
    # Personal Information
    nombre = models.CharField(max_length=200, verbose_name="Nombre completo")
    fecha_nacimiento = models.DateField(verbose_name="Fecha de nacimiento", null=True, blank=True)
    edad = models.PositiveIntegerField(verbose_name="Edad", null=True, blank=True)
    genero = models.CharField(max_length=20, choices=GENDER_CHOICES, default='Masculino', verbose_name="Género")
    cc = models.CharField(max_length=20, unique=True, verbose_name="Cédula de ciudadanía (ID)")
    direccion = models.TextField(blank=True, null=True, verbose_name="Dirección")
    
    # Medical Information
    eps = models.CharField(max_length=100, verbose_name="EPS")
    alergias = models.TextField(blank=True, null=True, verbose_name="Alergias")
    diagnosticos = models.TextField(blank=True, null=True, verbose_name="Diagnósticos")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Estable', verbose_name="Estado")
    
    # Clinical History
    enfermedades_previas = models.TextField(blank=True, null=True, verbose_name="Enfermedades previas")
    cirugias = models.TextField(blank=True, null=True, verbose_name="Cirugías previas")
    
    # Emergency Contact
    nombre_acudiente = models.CharField(max_length=200, verbose_name="Nombre del acudiente")
    telefono_acudiente = models.CharField(max_length=20, verbose_name="Teléfono del acudiente")
    
    # Hospital Information
    room = models.CharField(max_length=10, blank=True, null=True, verbose_name="Habitación")
    fecha_ingreso = models.DateTimeField(default=timezone.now, verbose_name="Fecha de ingreso")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.nombre} - Hab. {self.room or 'Sin asignar'}"


class Medication(models.Model):
    """Modelo de Medicación para cada paciente"""
    
    STATUS_CHOICES = [
        ('available', 'Disponible'),
        ('due', 'Pendiente'),
        ('given', 'Administrado'),
    ]
    
    ROUTE_CHOICES = [
        ('VO', 'Vía Oral'),
        ('IV', 'Intravenoso'),
        ('IM', 'Intramuscular'),
        ('SC', 'Subcutáneo'),
        ('TOP', 'Tópico'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medications')
    name = models.CharField(max_length=200, verbose_name="Nombre del medicamento")
    dose = models.CharField(max_length=100, verbose_name="Dosis")
    route = models.CharField(max_length=10, choices=ROUTE_CHOICES, default='VO', verbose_name="Vía")
    freq = models.CharField(max_length=100, verbose_name="Frecuencia")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Medicación"
        verbose_name_plural = "Medicaciones"
    
    def __str__(self):
        return f"{self.name} - {self.dose} ({self.patient.nombre})"


class MedicalNote(models.Model):
    """Modelo para notas médicas"""
    
    NOTE_TYPE_CHOICES = [
        ('LAB', 'Laboratorio'),
        ('VITALS', 'Signos Vitales'),
        ('MED', 'Medicación'),
        ('PROCEDURE', 'Procedimiento'),
        ('GENERAL', 'General'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_notes')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Creado por (Usuario)")

    note_type = models.CharField(max_length=20, choices=NOTE_TYPE_CHOICES, default='GENERAL')
    title = models.CharField(max_length=200, verbose_name="Título")
    content = models.TextField(verbose_name="Contenido")
    doctor_name = models.CharField(max_length=200, verbose_name="Por:")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Nota Médica"
        verbose_name_plural = "Notas Médicas"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.patient.nombre}"


class MedicationHistory(models.Model):
    """Historial de administración de medicamentos"""
    
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, related_name='history')
    administered_at = models.DateTimeField(default=timezone.now)
    administered_by_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='meds_given')
    administered_by = models.CharField(max_length=200, verbose_name="Administrado por")
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Historial de Medicación"
        verbose_name_plural = "Historiales de Medicación"
        ordering = ['-administered_at']
    
    def __str__(self):
        return f"{self.medication.name} - {self.administered_at}"


class NoteEditHistory(models.Model):
    """Historial de ediciones de notas médicas para auditoría"""
    
    note = models.ForeignKey(MedicalNote, on_delete=models.CASCADE, related_name='edit_history')
    edited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Editado por")
    edited_at = models.DateTimeField(default=timezone.now, verbose_name="Fecha de edición")
    previous_content = models.TextField(verbose_name="Contenido anterior")
    new_content = models.TextField(verbose_name="Contenido nuevo")
    previous_title = models.CharField(max_length=200, verbose_name="Título anterior")
    new_title = models.CharField(max_length=200, verbose_name="Título nuevo")
    
    class Meta:
        verbose_name = "Historial de Edición de Nota"
        verbose_name_plural = "Historiales de Edición de Notas"
        ordering = ['-edited_at']
    
    def __str__(self):
        return f"Edición de {self.note.title} por {self.edited_by} el {self.edited_at}"
