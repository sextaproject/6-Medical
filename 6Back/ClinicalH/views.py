from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Patient, Medication, MedicalNote, MedicationHistory
from .serializers import (
    PatientListSerializer, 
    PatientDetailSerializer, 
    PatientCreateSerializer,
    MedicationSerializer,
    MedicalNoteSerializer,
    MedicationHistorySerializer
)


class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD de Pacientes
    
    list: Obtener lista de todos los pacientes
    retrieve: Obtener detalle de un paciente específico
    create: Crear un nuevo paciente
    update: Actualizar un paciente existente
    destroy: Eliminar un paciente
    """
    queryset = Patient.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PatientListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PatientCreateSerializer
        return PatientDetailSerializer
    
    def list(self, request):
        """Obtener lista de pacientes con formato para el frontend"""
        patients = self.get_queryset()
        serializer = PatientListSerializer(patients, many=True)
        
        # Format response to match frontend expected structure
        formatted_patients = []
        for patient in serializer.data:
            formatted_patients.append({
                'id': f"p{patient['id']}",
                'name': patient['nombre'],
                'cc': patient['cc'] or '',
                'genero': patient['genero'],
                'room': patient['room'] or '',
                'age': patient['edad'],
                'eps': patient['eps'],
                'status': patient['status'],
                'medsDue': patient['meds_due'],
            })
        
        return Response({
            'patients': formatted_patients,
            'total': len(formatted_patients)
        })
    
    def retrieve(self, request, pk=None):
        """Obtener detalle completo de un paciente"""
        # Handle both 'p1' format and numeric IDs
        patient_id = pk.replace('p', '') if pk.startswith('p') else pk
        patient = get_object_or_404(Patient, pk=patient_id)
        serializer = PatientDetailSerializer(patient)
        
        # Format response for frontend
        data = serializer.data
        formatted = {
            'id': f"p{data['id']}",
            'name': data['nombre'],
            'cc': data['cc'] or '',
            'genero': data['genero'],
            'room': data['room'] or '',
            'age': data['edad'],
            'eps': data['eps'],
            'status': data['status'],
            'direccion': data['direccion'] or '',
            'alergias': data['alergias'] or '',
            'diagnosticos': data['diagnosticos'] or '',
            'enfermedadesPrevias': data['enfermedades_previas'] or '',
            'cirugias': data['cirugias'] or '',
            'nombreAcudiente': data['nombre_acudiente'],
            'telefono': data['telefono_acudiente'],
            'medsDue': data['meds_due'],
            'medications': [
                {
                    'id': med['id'],
                    'name': med['name'],
                    'dose': med['dose'],
                    'route': med['route'],
                    'freq': med['freq'],
                    'status': med['status'],
                }
                for med in data['medications']
            ],
            'medicalNotes': [
                {
                    'id': note['id'],
                    'type': note['note_type'],
                    'title': note['title'],
                    'content': note['content'],
                    'doctorName': note['doctor_name'],
                    'createdAt': note['created_at'],
                }
                for note in data['medical_notes']
            ],
        }
        
        return Response(formatted)
    
    def create(self, request):
        """Crear nuevo paciente"""
        # Map frontend field names to backend field names
        data = {
            'nombre': request.data.get('nombre'),
            'edad': request.data.get('edad'),
            'genero': request.data.get('genero', 'Masculino'),
            'eps': request.data.get('eps'),
            'alergias': request.data.get('alergias', ''),
            'diagnosticos': request.data.get('diagnosticos', ''),
            'nombre_acudiente': request.data.get('nombreAcudiente'),
            'telefono_acudiente': request.data.get('telefono'),
            'enfermedades_previas': request.data.get('enfermedadesPrevias', ''),
            'cirugias': request.data.get('cirugias', ''),
            'direccion': request.data.get('direccion', ''),
            'cc': request.data.get('cc', ''),
            'status': request.data.get('status', 'Estable'),
        }
        
        serializer = PatientCreateSerializer(data=data)
        if serializer.is_valid():
            patient = serializer.save()
            return Response({
                'message': 'Paciente creado exitosamente',
                'patient': {
                    'id': f"p{patient.id}",
                    'name': patient.nombre,
                    'room': patient.room,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, pk=None):
        """Eliminar paciente"""
        patient_id = pk.replace('p', '') if pk.startswith('p') else pk
        patient = get_object_or_404(Patient, pk=patient_id)
        patient.delete()
        return Response({'message': 'Paciente eliminado'}, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def add_medication(self, request, pk=None):
        """Añadir medicación a un paciente"""
        patient_id = pk.replace('p', '') if pk.startswith('p') else pk
        patient = get_object_or_404(Patient, pk=patient_id)
        
        medication_data = {
            'patient': patient,
            'name': request.data.get('name'),
            'dose': request.data.get('dose'),
            'route': request.data.get('route', 'VO'),
            'freq': request.data.get('freq'),
            'status': request.data.get('status', 'available'),
        }
        
        medication = Medication.objects.create(**medication_data)
        serializer = MedicationSerializer(medication)
        
        return Response({
            'message': 'Medicación añadida',
            'medication': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], url_path='medications/(?P<med_id>[^/.]+)')
    def delete_medication(self, request, pk=None, med_id=None):
        """Eliminar medicación de un paciente"""
        patient_id = pk.replace('p', '') if pk.startswith('p') else pk
        patient = get_object_or_404(Patient, pk=patient_id)
        medication = get_object_or_404(Medication, pk=med_id, patient=patient)
        medication.delete()
        
        return Response({'message': 'Medicación eliminada'}, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Añadir nota médica a un paciente"""
        patient_id = pk.replace('p', '') if pk.startswith('p') else pk
        patient = get_object_or_404(Patient, pk=patient_id)
        
        note_data = {
            'patient': patient,
            'note_type': request.data.get('type', 'GENERAL'),
            'title': request.data.get('title'),
            'content': request.data.get('content'),
            'doctor_name': request.data.get('doctorName'),
        }
        
        note = MedicalNote.objects.create(**note_data)
        serializer = MedicalNoteSerializer(note)
        
        return Response({
            'message': 'Nota médica añadida',
            'note': serializer.data
        }, status=status.HTTP_201_CREATED)


class MedicationViewSet(viewsets.ModelViewSet):
    """ViewSet para operaciones de Medicación"""
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    
    @action(detail=True, methods=['post'])
    def administer(self, request, pk=None):
        """Registrar administración de medicamento"""
        medication = self.get_object()
        
        history = MedicationHistory.objects.create(
            medication=medication,
            administered_by=request.data.get('administered_by', 'Enfermera'),
            notes=request.data.get('notes', '')
        )
        
        medication.status = 'given'
        medication.save()
        
        return Response({
            'message': 'Medicamento administrado',
            'history': MedicationHistorySerializer(history).data
        })


class MedicalNoteViewSet(viewsets.ModelViewSet):
    """ViewSet para operaciones de Notas Médicas"""
    queryset = MedicalNote.objects.all()
    serializer_class = MedicalNoteSerializer
