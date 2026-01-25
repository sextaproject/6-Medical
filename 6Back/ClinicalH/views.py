from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Patient, Medication, MedicalNote, MedicationHistory, NoteEditHistory
from .serializers import (
    PatientListSerializer, 
    PatientDetailSerializer, 
    PatientCreateSerializer,
    MedicationSerializer,
    MedicalNoteSerializer,
    MedicationHistorySerializer
)
from .permissions import (
    IsAuthorOrReadOnlyAndRecent,
    CanDeletePatient,
    CanCreatePatient,
    CanEditNote,
    CanManageMedication,
    is_readonly_user,
    is_superuser,
    is_nurse
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that includes user information"""
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
            # Add user information to the token response
            data['user'] = {
                'id': self.user.id,
                'username': self.user.username,
                'is_superuser': self.user.is_superuser or is_superuser(self.user),
                'is_readonly': is_readonly_user(self.user),
                'is_nurse': is_nurse(self.user),
            }
            return data
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Token validation error: {e}")
            raise


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that includes user information"""
    serializer_class = CustomTokenObtainPairSerializer
    
    @method_decorator(ratelimit(key='ip', rate='5/m', method='POST'))
    def post(self, request, *args, **kwargs):
        """Rate limit login attempts to 5 per minute per IP"""
        return super().post(request, *args, **kwargs)


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    permission_classes = [permissions.IsAuthenticated, CanCreatePatient, CanDeletePatient]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PatientListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PatientCreateSerializer
        return PatientDetailSerializer
    
    def get_permissions(self):
        """
        Override to apply different permissions based on action.
        Read-only users can only read, not modify.
        """
        if self.action == 'destroy':
            permission_classes = [permissions.IsAuthenticated, CanDeletePatient]
        elif self.action == 'create':
            permission_classes = [permissions.IsAuthenticated, CanCreatePatient]
        elif self.action in ['update', 'partial_update']:
            # Only superuser can update patients
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def update(self, request, *args, **kwargs):
        """Only superuser can update patients"""
        if not is_superuser(request.user):
            return Response(
                {'detail': 'No tiene permisos para editar pacientes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """Only superuser can partially update patients"""
        if not is_superuser(request.user):
            return Response(
                {'detail': 'No tiene permisos para editar pacientes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """Only superuser and nurses can create patients. Read-only users cannot."""
        if is_readonly_user(request.user):
            return Response(
                {'detail': 'No tiene permisos para crear pacientes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Only superuser (willarevalo) can delete patients"""
        if not is_superuser(request.user):
            return Response(
                {'detail': 'No tiene permisos para eliminar pacientes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    def list(self, request):
        """Obtener lista de pacientes con formato para el frontend"""
        patients = self.get_queryset()
        serializer = PatientListSerializer(patients, many=True)
        return Response({
            'patients': serializer.data,
            'total': len(serializer.data)
        })
    
    @action(detail=True, methods=['post'])
    def discharge(self, request, pk=None):
        """
        SPECIAL FUNCTION: Discharge a patient (Dar de alta).
        Changes status and records the time.
        """
        patient = self.get_object()
        
        # Validar si ya está dado de alta
        if patient.status == 'Alta':
            return Response(
                {'message': 'El paciente fue dado de alta'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update status
        patient.status = 'Alta'
        patient.save()
        
        # Create a system note automatically
        MedicalNote.objects.create(
            patient=patient,
            created_by=request.user,
            doctor_name="SISTEMA",
            note_type='GENERAL',
            title='ALTA MÉDICA',
            content=f"Paciente dado de alta por {request.user.get_full_name() or request.user.username} el {timezone.now()}"
        )

        return Response({'message': 'Paciente dado de alta exitosamente'})

    @action(detail=True, methods=['post'], permission_classes=[CanManageMedication])
    def add_medication(self, request, pk=None):
        """Add medication to a patient. Only superuser and nurses can do this."""
        if is_readonly_user(request.user):
            return Response(
                {'detail': 'No tiene permisos para agregar medicamentos.'},
                status=status.HTTP_403_FORBIDDEN
            )
        patient = self.get_object()
        data = request.data.copy()
        data['patient'] = patient.id
        
        serializer = MedicationSerializer(data=data)
        if serializer.is_valid():
            serializer.save(patient=patient)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Shortcut to add a note directly to a patient. Supports file upload for evidence photos."""
        if is_readonly_user(request.user):
            return Response(
                {'detail': 'No tiene permisos para crear notas.'},
                status=status.HTTP_403_FORBIDDEN
            )
        patient = self.get_object()
        
        # Handle both JSON and multipart/form-data requests
        note_data = {
            'patient': patient,
            'created_by': request.user,
            'doctor_name': request.user.get_full_name() or request.user.username,
            'note_type': request.data.get('type', 'GENERAL'),
            'title': request.data.get('title', 'Nota General'),
            'content': request.data.get('content', '')
        }
        
        # Handle evidence photo if provided
        evidence_photo = request.FILES.get('evidence_photo')
        if evidence_photo:
            # Validate file size (max 10MB)
            if evidence_photo.size > 10 * 1024 * 1024:
                return Response(
                    {'detail': 'La imagen no puede ser mayor a 10MB.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Validate file type
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if evidence_photo.content_type not in allowed_types:
                return Response(
                    {'detail': 'Solo se permiten imágenes (JPEG, PNG, GIF, WEBP).'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            note_data['evidence_photo'] = evidence_photo
        
        note = MedicalNote.objects.create(**note_data)
        
        # Pass request context for building absolute URLs
        serializer = MedicalNoteSerializer(note, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageMedication]
    
    def get_permissions(self):
        """Apply medication management permissions"""
        if self.action == 'destroy':
            # Only superuser and nurses can delete medications
            permission_classes = [permissions.IsAuthenticated, CanManageMedication]
        else:
            permission_classes = [permissions.IsAuthenticated, CanManageMedication]
        return [permission() for permission in permission_classes]
    
    def destroy(self, request, *args, **kwargs):
        """Only superuser and nurses can delete medications"""
        if is_readonly_user(request.user):
            return Response(
                {'detail': 'No tiene permisos para eliminar medicamentos.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def administer(self, request, pk=None):
        """
        Registrar administración de medicamento.
        SAVES THE STATE so others know it was given.
        """
        medication = self.get_object()
        
        # 1. Create history record linked to the specific user
        history = MedicationHistory.objects.create(
            medication=medication,
            administered_by_user=request.user,  # <--- Linked User
            administered_by=request.user.get_full_name() or request.user.username,
            notes=request.data.get('notes', '')
        )
        
        # 2. Update status
        medication.status = 'given'
        medication.save()
        
        return Response({
            'message': 'Medicamento administrado',
            'history': MedicationHistorySerializer(history).data
        })

class MedicalNoteViewSet(viewsets.ModelViewSet):
    """
    Standard CRUD for notes.
    Uses CanEditNote to enforce role-based edit rules:
    - SUPERUSER: Can edit any note at any time
    - Nurses: Can edit only their own notes within 48 hours
    - Read-only users: Cannot edit notes
    """
    queryset = MedicalNote.objects.all()
    serializer_class = MedicalNoteSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditNote]

    def perform_create(self, serializer):
        """Automatically attach the user when creating via the standard endpoint"""
        if is_readonly_user(self.request.user):
            raise permissions.PermissionDenied('No tiene permisos para crear notas.')
        serializer.save(
            created_by=self.request.user,
            doctor_name=self.request.user.get_full_name() or self.request.user.username
        )
    
    def perform_update(self, serializer):
        """Track note edits in history before updating"""
        instance = self.get_object()
        
        # Save previous values for history
        previous_title = instance.title
        previous_content = instance.content
        
        # Update the note
        serializer.save()
        
        # Create edit history record
        NoteEditHistory.objects.create(
            note=instance,
            edited_by=self.request.user,
            previous_title=previous_title,
            new_title=instance.title,
            previous_content=previous_content,
            new_content=instance.content
        )
