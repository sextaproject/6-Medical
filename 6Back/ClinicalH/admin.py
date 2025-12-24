from django.contrib import admin
from .models import Patient, Medication, MedicalNote, MedicationHistory


class MedicationInline(admin.TabularInline):
    model = Medication
    extra = 1


class MedicalNoteInline(admin.TabularInline):
    model = MedicalNote
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'edad', 'genero', 'room', 'eps', 'status', 'fecha_ingreso']
    list_filter = ['status', 'genero', 'eps']
    search_fields = ['nombre', 'cc', 'room']
    inlines = [MedicationInline, MedicalNoteInline]
    fieldsets = (
        ('Información Personal', {
            'fields': ('nombre', 'edad', 'genero', 'cc', 'direccion')
        }),
        ('Información Médica', {
            'fields': ('eps', 'alergias', 'diagnosticos', 'status')
        }),
        ('Antecedentes Clínicos', {
            'fields': ('enfermedades_previas', 'cirugias')
        }),
        ('Contacto de Emergencia', {
            'fields': ('nombre_acudiente', 'telefono_acudiente')
        }),
        ('Hospitalización', {
            'fields': ('room', 'fecha_ingreso')
        }),
    )


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ['name', 'patient', 'dose', 'route', 'freq', 'status']
    list_filter = ['status', 'route']
    search_fields = ['name', 'patient__nombre']


@admin.register(MedicalNote)
class MedicalNoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient', 'note_type', 'doctor_name', 'created_at']
    list_filter = ['note_type', 'created_at']
    search_fields = ['title', 'content', 'patient__nombre']


@admin.register(MedicationHistory)
class MedicationHistoryAdmin(admin.ModelAdmin):
    list_display = ['medication', 'administered_at', 'administered_by']
    list_filter = ['administered_at']
