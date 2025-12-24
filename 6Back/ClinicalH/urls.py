from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, MedicationViewSet, MedicalNoteViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'medications', MedicationViewSet, basename='medication')
router.register(r'notes', MedicalNoteViewSet, basename='note')

urlpatterns = [
    path('', include(router.urls)),
]

