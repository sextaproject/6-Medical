import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, styled, Paper, Container, Box, Grid, Button, TextField, 
  Chip, Stack, Divider, List, ListItem, ListItemText, Avatar, 
  IconButton, Modal, Fade, Backdrop, InputAdornment, CircularProgress,
  Autocomplete, Snackbar, Alert
} from '@mui/material';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeIcon from '@mui/icons-material/Home';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';

// Patient avatar images
import maleAvatar1 from '../assets/m1.png';
import maleAvatar2 from '../assets/m2.png';
import maleAvatar3 from '../assets/m3.png';
import femaleAvatar1 from '../assets/f1.png';
import femaleAvatar2 from '../assets/f2.png';

// API
import axiosInstance from '../api/axios';
import { showError, showSuccess, handleApiError } from '../utils/errorHandler';

const MALE_AVATARS = [maleAvatar1, maleAvatar2, maleAvatar3];
const FEMALE_AVATARS = [femaleAvatar1, femaleAvatar2];

const DIET_OPTIONS = ["Dieta Normal", "Dieta Blanda", "Dieta Hiperproteica", "No Papaya"];
const TIME_SLOTS = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

const CommonBackground = styled(Box)(() => ({
  position: 'fixed',
  inset: 0,
  background: 'radial-gradient(circle at 8% 10%, rgba(30,136,229,0.10), transparent 40%), radial-gradient(circle at 90% 0%, rgba(16,185,129,0.10), transparent 45%), linear-gradient(180deg, #f7faff 0%, #eef3fb 100%)',
  pointerEvents: 'none',
  zIndex: -1,
}));

const HeroCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3.5),
  borderRadius: '28px',
  background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 55%, #64b5f6 100%)',
  color: '#fff',
  boxShadow: '0 24px 60px rgba(30,136,229,0.35)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const ClinicalCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '24px',
  backgroundColor: '#ffffff',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '999px',
  backgroundColor:'#1e88e5',
  color: '#fff',
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  boxShadow: '0 10px 24px rgba(30,136,229,0.35)',
  transition: 'all 0.2s ease',
  '&:hover': { backgroundColor: '#1976d2', transform: 'translateY(-2px)', boxShadow: '0 14px 30px rgba(30,136,229,0.4)' },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: '#111827',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& .icon': { color: '#1e88e5' }
}));

function ClinicalDashboard() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // If navigated from menu, we might have the list to navigate between patients
  const incomingPatientsList = location.state?.patients;
  const [navPatients, setNavPatients] = useState(incomingPatientsList || []);

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vitals, setVitals] = useState({ bp: { sbp: '', dbp: '' }, hr: '', fr: '', temp: '' });
  const [note, setNote] = useState('');
  
  // Local history for display in the sidebar (just for the session/view)
  const [sessionHistory, setSessionHistory] = useState([]);
  
  const [showMedHistory, setShowMedHistory] = useState(false);
  const [showNotesHistory, setShowNotesHistory] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [notesWeekOffset, setNotesWeekOffset] = useState(0);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [newMedicine, setNewMedicine] = useState({ name: '', dose: '', route: 'VO', freq: '' });
  const [showDischargeConfirm, setShowDischargeConfirm] = useState(false);
  
  // Medicine history from localStorage
  const [medicineHistory, setMedicineHistory] = useState({
    names: [],
    doses: [],
    frequencies: []
  });
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [updatingPatient, setUpdatingPatient] = useState(false);
  const [showEditMedicineModal, setShowEditMedicineModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [updatingMedicine, setUpdatingMedicine] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- API Calls ---

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`patients/${id}/`);
      const data = response.data;
      
      // Map Backend Data to Frontend State
      setPatient({
        id: data.id,
        name: data.nombre,
        fechaNacimiento: data.fecha_nacimiento,
        age: data.edad,
        diagnosis: data.diagnosticos || 'Sin Diagnóstico',
        admissionDate: data.fecha_ingreso,
        room: data.room,
        allergies: data.alergias,
        genero: data.genero,
        cc: data.cc,
        eps: data.eps,
        diet: "Dieta Normal", // Placeholder if backend doesn't support diet yet
        status: data.status,
        isDischarged: data.status === 'Alta',
        medications: data.medications || [],
        medicalNotes: data.medical_notes || [],
      });
    } catch (error) {
      // Error handling - log only in development
      if (import.meta.env.DEV) {
        console.error("Error fetching patient:", error);
      }
      handleApiError(error, setSnackbar, 'Error al cargar datos del paciente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPatientData();
    
    // Get current user info
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        setCurrentUser(JSON.parse(userInfo));
      } catch (error) {
        // Error parsing user info - log only in development
        if (import.meta.env.DEV) {
          console.error('Error parsing user_info:', error);
        }
        // Clear invalid user info
        localStorage.removeItem('user_info');
      }
    }
    
    // Load medicine history from localStorage
    const savedNames = JSON.parse(localStorage.getItem('medicine_names') || '[]');
    const savedDoses = JSON.parse(localStorage.getItem('medicine_doses') || '[]');
    const savedFrequencies = JSON.parse(localStorage.getItem('medicine_frequencies') || '[]');
    setMedicineHistory({
      names: savedNames,
      doses: savedDoses,
      frequencies: savedFrequencies
    });
  }, [id]);

  useEffect(() => {
    if (Array.isArray(incomingPatientsList) && incomingPatientsList.length) {
      const activeOnly = incomingPatientsList.filter((p) => p.status !== 'Alta');
      setNavPatients(activeOnly);
      return;
    }

    const fetchPatientsForNavigation = async () => {
      try {
        const response = await axiosInstance.get('patients/');
        const formattedPatients = response.data.patients
          .filter((p) => p.status !== 'Alta')
          .map((p) => ({
            id: p.id,
            name: p.nombre,
            age: p.edad,
            genero: p.genero,
            cc: p.cc,
            room: p.room,
            eps: p.eps,
            status: p.status,
            medsDue: p.meds_due,
            admissionDate: p.fecha_ingreso,
          }));
        setNavPatients(formattedPatients);
      } catch (error) {
        // Error handling - log only in development
        if (import.meta.env.DEV) {
          console.error("Error fetching patients list:", error);
        }
      }
    };

    fetchPatientsForNavigation();
  }, [incomingPatientsList]);

  // --- Navigation Logic ---
  const orderedPatients = useMemo(() => {
    if (Array.isArray(navPatients) && navPatients.length) {
      return [...navPatients].sort((a, b) => {
        const toNum = (pid) => parseInt(String(pid).replace(/\D+/g, ''), 10) || 0;
        return toNum(a.id) - toNum(b.id);
      });
    }
    return null;
  }, [navPatients]);

  const currentIndex = orderedPatients && patient
    ? orderedPatients.findIndex((p) => String(p.id) === String(patient.id))
    : -1;

  const goToPatient = (direction) => {
    if (!orderedPatients || orderedPatients.length === 0) return;
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = orderedPatients.length - 1;
    else if (nextIndex >= orderedPatients.length) nextIndex = 0;
    
    const nextPatient = orderedPatients[nextIndex];
    navigate(`/patient/${nextPatient.id}`, { state: { patients: orderedPatients } });
  };

  // --- Actions ---

  const handleAdminister = async (medId) => {
    try {
        const response = await axiosInstance.post(`medications/${medId}/administer/`, {
            notes: 'Administrado desde Dashboard'
        });
        
        // Use the returned history object to show WHO administered it
        const historyItem = response.data.history;
        
        setPatient(prev => ({
            ...prev,
            medications: prev.medications.map(m => 
                m.id === medId 
                ? { ...m, status: 'given', last_history: historyItem } 
                : m
            )
        }));

        addToSessionHistory('MED', `Administrado por ${historyItem.administered_by}`);
        showSuccess('Medicamento administrado exitosamente', setSnackbar);
    } catch (error) {
        handleApiError(error, setSnackbar, 'Error al registrar administración.');
    }
  };

  const handleSaveNote = async () => {
    if (!note && !vitals.bp.sbp) return;
    
    // Validate word count
    const wordCount = note.trim() ? note.trim().split(/\s+/).length : 0;
    if (wordCount > 2000) {
      showError('La nota no puede exceder 2000 palabras. Por favor, reduzca el contenido.', setSnackbar);
      return;
    }
    
    // Validate vital signs ranges
    if (vitals.bp.sbp && (parseInt(vitals.bp.sbp) < 0 || parseInt(vitals.bp.sbp) > 300)) {
      showError('La presión arterial sistólica debe estar entre 0 y 300 mmHg.', setSnackbar);
      return;
    }
    if (vitals.bp.dbp && (parseInt(vitals.bp.dbp) < 0 || parseInt(vitals.bp.dbp) > 200)) {
      showError('La presión arterial diastólica debe estar entre 0 y 200 mmHg.', setSnackbar);
      return;
    }
    if (vitals.hr && (parseInt(vitals.hr) < 0 || parseInt(vitals.hr) > 220)) {
      showError('La frecuencia cardíaca debe estar entre 0 y 220 bpm.', setSnackbar);
      return;
    }
    if (vitals.fr && (parseInt(vitals.fr) < 0 || parseInt(vitals.fr) > 60)) {
      showError('La frecuencia respiratoria debe estar entre 0 y 60 rpm.', setSnackbar);
      return;
    }
    if (vitals.temp && (parseFloat(vitals.temp) < 30 || parseFloat(vitals.temp) > 45)) {
      showError('La temperatura debe estar entre 30 y 45°C.', setSnackbar);
      return;
    }
    
    // Construct content string
    const vitalsParts = [];
    if (vitals.bp.sbp || vitals.bp.dbp) vitalsParts.push(`PA:${vitals.bp.sbp || ''}/${vitals.bp.dbp || ''}`);
    if (vitals.hr) vitalsParts.push(`FC:${vitals.hr}`);
    if (vitals.fr) vitalsParts.push(`FR:${vitals.fr}`);
    if (vitals.temp) vitalsParts.push(`Temp:${vitals.temp}`);
    const fullContent = `${vitalsParts.join(' ')}\n${note}`.trim();

    try {
        const response = await axiosInstance.post(`patients/${patient.id}/add_note/`, {
            title: 'Nota de Evolución',
            type: 'VITALS',
            content: fullContent
        });
        
        // Add to local list immediately
        setPatient(prev => ({
            ...prev,
            medicalNotes: [response.data, ...prev.medicalNotes]
        }));
        
        addToSessionHistory('NOTE', `Nota guardada exitosamente`);
        setVitals({ bp: { sbp: '', dbp: '' }, hr: '', fr: '', temp: '' });
        setNote('');
        showSuccess('Nota guardada exitosamente', setSnackbar);
    } catch (error) {
        handleApiError(error, setSnackbar, 'Error al guardar nota.');
    }
  };

  const handleAddMedicine = async () => {
    // Validation
    if (!newMedicine.name || !newMedicine.name.trim()) {
      showError('El nombre del medicamento es requerido.', setSnackbar);
      return;
    }
    if (!newMedicine.dose || !newMedicine.dose.trim()) {
      showError('La dosis es requerida.', setSnackbar);
      return;
    }
    if (!newMedicine.freq || !newMedicine.freq.trim()) {
      showError('La frecuencia es requerida.', setSnackbar);
      return;
    }
    
    try {
        const response = await axiosInstance.post(`patients/${patient.id}/add_medication/`, {
            name: newMedicine.name.trim(),
            dose: newMedicine.dose.trim(),
            route: newMedicine.route,
            freq: newMedicine.freq.trim(),
            status: 'due'
        });
        
        setPatient(prev => ({
            ...prev,
            medications: [...prev.medications, response.data]
        }));
        
        // Save to medicine history (localStorage)
        const medicineName = newMedicine.name.trim();
        const medicineDose = newMedicine.dose.trim();
        const medicineFreq = newMedicine.freq.trim();
        
        // Update names history
        const updatedNames = [...medicineHistory.names];
        if (!updatedNames.includes(medicineName)) {
          updatedNames.unshift(medicineName);
          // Keep only last 50 entries
          if (updatedNames.length > 50) updatedNames.pop();
          localStorage.setItem('medicine_names', JSON.stringify(updatedNames));
        }
        
        // Update doses history
        const updatedDoses = [...medicineHistory.doses];
        if (!updatedDoses.includes(medicineDose)) {
          updatedDoses.unshift(medicineDose);
          if (updatedDoses.length > 30) updatedDoses.pop();
          localStorage.setItem('medicine_doses', JSON.stringify(updatedDoses));
        }
        
        // Update frequencies history
        const updatedFrequencies = [...medicineHistory.frequencies];
        if (!updatedFrequencies.includes(medicineFreq)) {
          updatedFrequencies.unshift(medicineFreq);
          if (updatedFrequencies.length > 30) updatedFrequencies.pop();
          localStorage.setItem('medicine_frequencies', JSON.stringify(updatedFrequencies));
        }
        
        // Update state
        setMedicineHistory({
          names: updatedNames.slice(0, 50),
          doses: updatedDoses.slice(0, 30),
          frequencies: updatedFrequencies.slice(0, 30)
        });
        
        addToSessionHistory('NOTE', `Nuevo medicamento: ${newMedicine.name}`);
        setNewMedicine({ name: '', dose: '', route: 'VO', freq: '' });
        setShowAddMedicine(false);
        showSuccess(`Medicamento "${newMedicine.name}" agregado exitosamente`, setSnackbar);
    } catch (error) {
        handleApiError(error, setSnackbar, 'Error al agregar medicamento.');
    }
  };

  const handleDeleteMedicine = async (medId) => {
      // Assuming you implement a delete endpoint in Django (Standard ViewSet has destroy)
      if(!window.confirm("¿Eliminar medicamento?")) return;
      try {
          await axiosInstance.delete(`medications/${medId}/`);
          setPatient(prev => ({
              ...prev,
              medications: prev.medications.filter(m => m.id !== medId)
          }));
          addToSessionHistory('MED', 'Medicamento eliminado');
          showSuccess('Medicamento eliminado exitosamente', setSnackbar);
      } catch (error) {
          handleApiError(error, setSnackbar, 'Error al eliminar medicamento.');
      }
  };

  const handleEditMedicineOpen = (med) => {
    setEditingMedicine({
      id: med.id,
      name: med.name || '',
      dose: med.dose || '',
      route: med.route || 'VO',
      freq: med.freq || '',
    });
    setShowEditMedicineModal(true);
  };

  const handleEditMedicineChange = (field) => (e) => {
    const value = e.target.value;
    setEditingMedicine(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateMedicine = async () => {
    if (!editingMedicine) return;
    
    // Validation
    if (!editingMedicine.name || !editingMedicine.name.trim()) {
      showError('El nombre del medicamento es requerido.', setSnackbar);
      return;
    }
    if (!editingMedicine.dose || !editingMedicine.dose.trim()) {
      showError('La dosis es requerida.', setSnackbar);
      return;
    }
    if (!editingMedicine.freq || !editingMedicine.freq.trim()) {
      showError('La frecuencia es requerida.', setSnackbar);
      return;
    }
    
    setUpdatingMedicine(true);
    
    try {
      const response = await axiosInstance.patch(`medications/${editingMedicine.id}/`, {
        name: editingMedicine.name.trim(),
        dose: editingMedicine.dose.trim(),
        route: editingMedicine.route,
        freq: editingMedicine.freq.trim(),
      });
      
      // Update medication in local state
      setPatient(prev => ({
        ...prev,
        medications: prev.medications.map(m => 
          m.id === editingMedicine.id ? response.data : m
        )
      }));
      
      addToSessionHistory('MED', `Medicamento actualizado: ${editingMedicine.name}`);
      setShowEditMedicineModal(false);
      setEditingMedicine(null);
      showSuccess(`Medicamento "${editingMedicine.name}" actualizado exitosamente`, setSnackbar);
    } catch (error) {
      handleApiError(error, setSnackbar, 'Error al actualizar medicamento.');
    } finally {
      setUpdatingMedicine(false);
    }
  };

  const handleDischargePatient = async () => {
    try {
        await axiosInstance.post(`patients/${patient.id}/discharge/`);
        setPatient(prev => ({ ...prev, isDischarged: true, status: 'Alta' }));
        setShowDischargeConfirm(false);
        addToSessionHistory('NOTE', `Paciente dado de alta`);
        showSuccess('Paciente dado de alta exitosamente', setSnackbar);
    } catch (error) {
        handleApiError(error, setSnackbar, 'Error al dar de alta al paciente.');
    }
  };

  // Check if user can edit a note
  const canEditNote = (note) => {
    if (!currentUser) return false;
    
    // Superuser (willarevalo) can edit all notes
    if (currentUser.is_superuser) return true;
    
    // Read-only users cannot edit
    if (currentUser.is_readonly) return false;
    
    // Nurses can only edit their own notes within 48 hours
    if (currentUser.is_nurse) {
      // Check if note was created by current user
      // Handle both cases: created_by_id (number) or created_by (object with id)
      const noteCreatorId = note.created_by_id || (note.created_by && note.created_by.id) || note.created_by;
      if (noteCreatorId !== currentUser.id) return false;
      
      // Check if note is within 48 hours
      const noteDate = new Date(note.created_at);
      const now = new Date();
      const hoursDiff = (now - noteDate) / (1000 * 60 * 60);
      return hoursDiff <= 48;
    }
    
    return false;
  };

  const handleStartEditNote = (note) => {
    setEditingNote(note.id);
    setEditNoteTitle(note.title);
    setEditNoteContent(note.content);
  };

  const handleCancelEditNote = () => {
    setEditingNote(null);
    setEditNoteTitle('');
    setEditNoteContent('');
  };

  const handleSaveEditNote = async () => {
    if (!editingNote) return;
    
    try {
      const response = await axiosInstance.patch(`notes/${editingNote}/`, {
        title: editNoteTitle,
        content: editNoteContent
      });
      
      // Update the note in local state
      setPatient(prev => ({
        ...prev,
        medicalNotes: prev.medicalNotes.map(n => 
          n.id === editingNote ? response.data : n
        )
      }));
      
      setEditingNote(null);
      setEditNoteTitle('');
      setEditNoteContent('');
      addToSessionHistory('NOTE', 'Nota actualizada exitosamente');
      showSuccess('Nota actualizada exitosamente', setSnackbar);
    } catch (error) {
      handleApiError(error, setSnackbar, 'Error al actualizar la nota.');
    }
  };

  const addToSessionHistory = (type, text) => {
    setSessionHistory(prev => [{
      id: Date.now(), type, text,
      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    }, ...prev]);
  };

  // Calculate age from date of birth
  const calculateAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return '';
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Handle edit patient info
  const handleEditPatientOpen = async () => {
    try {
      // Fetch full patient data
      const response = await axiosInstance.get(`patients/${patient.id}/`);
      const data = response.data;
      
      setEditingPatient({
        nombre: data.nombre || '',
        fechaNacimiento: data.fecha_nacimiento || '',
        edad: data.edad ? data.edad.toString() : '',
        genero: data.genero || 'Masculino',
        cc: data.cc || '',
        eps: data.eps || '',
        alergias: data.alergias || '',
        diagnosticos: data.diagnosticos || '',
        direccion: data.direccion || '',
        nombreAcudiente: data.nombre_acudiente || '',
        telefono: data.telefono_acudiente || '',
        enfermedadesPrevias: data.enfermedades_previas || '',
        cirugias: data.cirugias || '',
      });
      setShowEditPatientModal(true);
    } catch (err) {
      handleApiError(err, setSnackbar, 'Error al cargar datos del paciente.');
    }
  };

  const handleEditPatientChange = (field) => (e) => {
    const value = e.target.value;
    setEditingPatient(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate age when fechaNacimiento changes
      if (field === 'fechaNacimiento' && value) {
        updated.edad = calculateAge(value);
      }
      return updated;
    });
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient) return;
    
    // Validation
    if (!editingPatient.nombre || !editingPatient.nombre.trim()) {
      showError('El nombre completo es requerido.', setSnackbar);
      return;
    }
    if (!editingPatient.cc || editingPatient.cc.length < 7 || editingPatient.cc.length > 20) {
      showError('La cédula de ciudadanía es requerida (7-20 dígitos).', setSnackbar);
      return;
    }
    if (!editingPatient.fechaNacimiento && (!editingPatient.edad || parseInt(editingPatient.edad) < 0 || parseInt(editingPatient.edad) > 150)) {
      showError('Debe proporcionar fecha de nacimiento o edad válida (0-150 años).', setSnackbar);
      return;
    }
    if (editingPatient.edad && (parseInt(editingPatient.edad) < 0 || parseInt(editingPatient.edad) > 150)) {
      showError('La edad debe estar entre 0 y 150 años.', setSnackbar);
      return;
    }
    if (!editingPatient.eps || !editingPatient.eps.trim()) {
      showError('La EPS es requerida.', setSnackbar);
      return;
    }
    
    setUpdatingPatient(true);
    
    const payload = {
      nombre: editingPatient.nombre.trim(),
      cc: editingPatient.cc,
      fecha_nacimiento: editingPatient.fechaNacimiento || null,
      edad: editingPatient.edad ? parseInt(editingPatient.edad) : null,
      genero: editingPatient.genero,
      direccion: editingPatient.direccion?.trim() || '',
      eps: editingPatient.eps.trim(),
      alergias: editingPatient.alergias?.trim() || '',
      diagnosticos: editingPatient.diagnosticos?.trim() || '',
      enfermedades_previas: editingPatient.enfermedadesPrevias?.trim() || '',
      cirugias: editingPatient.cirugias?.trim() || '',
      nombre_acudiente: editingPatient.nombreAcudiente?.trim() || '',
      telefono_acudiente: editingPatient.telefono || '',
    };

    try {
      const response = await axiosInstance.patch(`patients/${patient.id}/`, payload);
      
      // Update patient in local state
      setPatient(prev => ({
        ...prev,
        name: response.data.nombre,
        fechaNacimiento: response.data.fecha_nacimiento,
        age: response.data.edad,
        cc: response.data.cc,
        eps: response.data.eps,
        genero: response.data.genero,
        allergies: response.data.alergias,
        diagnosis: response.data.diagnosticos,
      }));
      
      setShowEditPatientModal(false);
      setEditingPatient(null);
      addToSessionHistory('INFO', `Información del paciente actualizada por ${currentUser?.username || 'usuario'}`);
      showSuccess('Información del paciente actualizada exitosamente', setSnackbar);
    } catch (err) {
      handleApiError(err, setSnackbar, 'Error al actualizar paciente.');
    } finally {
      setUpdatingPatient(false);
    }
  };

  const getDaysAdmitted = (dateString) => {
    if (!dateString) return 0;
    const start = new Date(dateString);
    const now = new Date();
    return Math.ceil(Math.abs(now - start) / (1000 * 60 * 60 * 24));
  };

  const getGenderMeta = (genero) => {
    const isFemale = genero?.toLowerCase() === 'femenino';
    const idNum = patient?.id ? parseInt(String(patient.id).replace(/\D+/g, ''), 10) : 0;
    const avatars = isFemale ? FEMALE_AVATARS : MALE_AVATARS;
    return {
      isFemale,
      color: isFemale ? '#e91e63' : '#2f84e4',
      avatar: avatars[idNum % avatars.length],
    };
  };

  // --- Calendar Helpers (Visual only, mapped to real data) ---
  const getWeekDays = (offset) => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1 + (offset * 7));
    return Array.from({length: 7}, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
    });
  };
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  if (loading || !patient) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CommonBackground />
        <Typography>Cargando historia clínica...</Typography>
    </Box>
  );

  const genderMeta = getGenderMeta(patient.genero);

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', py: 4, overflowX: 'hidden' }}>
      <CommonBackground />
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>
        
        {/* HEADER SECTION */}
        <HeroCard sx={{ mb: 3, position: 'relative' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => navigate('/clinical')}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.35)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                <HomeIcon />
              </IconButton>
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 1 }}>
                  Historia clínica
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  {patient.name}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box onClick={() => setShowNotesHistory(true)} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', px: 2, py: 1, borderRadius: '999px', bgcolor: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)' }}>
                <DescriptionIcon sx={{ color: '#fff' }} />
                <Typography variant="body2" fontWeight={600}>Notas</Typography>
              </Box>
              <Box onClick={() => setShowMedHistory(true)} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', px: 2, py: 1, borderRadius: '999px', bgcolor: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)' }}>
                <LocalPharmacyIcon sx={{ color: '#fff' }} />
                <Typography variant="body2" fontWeight={600}>Kardex</Typography>
              </Box>
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ mt: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {currentUser?.is_superuser ? (
                <Tooltip title="Hacer clic para editar información del paciente">
                  <Box
                    onClick={handleEditPatientOpen}
                    sx={{
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover .edit-overlay': {
                        opacity: 1,
                      },
                      '&:hover .avatar-border': {
                        borderColor: 'rgba(255,255,255,0.8)',
                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
                      },
                    }}
                  >
                    <Avatar 
                      src={genderMeta.avatar} 
                      className="avatar-border"
                      sx={{ 
                        width: 74, 
                        height: 74, 
                        border: '3px solid rgba(255,255,255,0.5)',
                        transition: 'all 0.3s ease',
                      }} 
                    />
                    <Box
                      className="edit-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '50%',
                        bgcolor: 'rgba(59, 130, 246, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                      }}
                    >
                      <EditIcon sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                  </Box>
                </Tooltip>
              ) : (
                <Avatar src={genderMeta.avatar} sx={{ width: 74, height: 74, border: '3px solid rgba(255,255,255,0.5)' }} />
              )}
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" fontWeight={700}>Paciente</Typography>
                  {patient.isDischarged && <Chip label="DADO DE ALTA" sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 'bold' }} />}
                </Stack>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {patient.fechaNacimiento ? `Nacimiento: ${new Date(patient.fechaNacimiento).toLocaleDateString('es-CO')} • ` : ''}
                  {patient.age ? `EDAD: ${patient.age} años • ` : ''}
                  CAMA: {patient.room || 'N/A'} • CC: {patient.cc || 'N/A'} • EPS: {patient.eps}
                </Typography>
                <Chip label={patient.diagnosis} variant="outlined" size="small" sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', fontWeight: 600, mt: 1 }} />
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h3" fontWeight="800">{getDaysAdmitted(patient.admissionDate)}</Typography>
                <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.85 }}>DÍAS ESTANCIA</Typography>
              </Box>
              <Tooltip title={patient.isDischarged ? "Paciente Alta" : "Dar de alta"}>
                <IconButton onClick={() => !patient.isDischarged && setShowDischargeConfirm(true)} sx={{ width: 50, height: 50, bgcolor: patient.isDischarged ? '#10b981' : '#ef4444', color: 'white', '&:hover': { bgcolor: patient.isDischarged ? '#059669' : '#dc2626' } }}>
                  <ExitToAppIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Navigation Arrows */}
          <Box sx={{ position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', zIndex: 10 }}>
            <IconButton onClick={() => goToPatient(-1)} sx={{ bgcolor: '#fff', boxShadow: '0 12px 24px rgba(15,23,42,0.18)', '&:hover': { bgcolor: '#f3f7ff' } }}>
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', zIndex: 10 }}>
            <IconButton onClick={() => goToPatient(1)} sx={{ bgcolor: '#fff', boxShadow: '0 12px 24px rgba(15,23,42,0.18)', '&:hover': { bgcolor: '#f3f7ff' } }}>
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Box>
        </HeroCard>

        {/* MAIN GRID */}
        <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
          
          {/* LEFT COL: Nurse Station */}
          <Grid item xs={12} md={9.5} sx={{ flex: { md: '0 0 70%' }, maxWidth: { md: '70%' } }}>
            <ClinicalCard>
              <SectionTitle variant="h5"><MonitorHeartIcon className="icon" /> Signos Vitales</SectionTitle>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <TextField 
                      label="PAS" 
                      size="small" 
                      type="number"
                      sx={{ width: 70 }} 
                      value={vitals.bp.sbp} 
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 300)) {
                          setVitals({...vitals, bp: { ...vitals.bp, sbp: value }});
                        }
                      }}
                      InputProps={{ 
                        sx: { borderRadius: '12px' },
                        inputProps: { min: 0, max: 300, step: 1 }
                      }}
                      error={vitals.bp.sbp && (parseInt(vitals.bp.sbp) < 0 || parseInt(vitals.bp.sbp) > 300)}
                      helperText={vitals.bp.sbp && (parseInt(vitals.bp.sbp) < 0 || parseInt(vitals.bp.sbp) > 300) ? 'Rango: 0-300' : ''}
                    />
                    <Typography>/</Typography>
                    <TextField 
                      label="PAD" 
                      size="small" 
                      type="number"
                      sx={{ width: 70 }} 
                      value={vitals.bp.dbp} 
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 200)) {
                          setVitals({...vitals, bp: { ...vitals.bp, dbp: value }});
                        }
                      }}
                      InputProps={{ 
                        sx: { borderRadius: '12px' },
                        inputProps: { min: 0, max: 200, step: 1 }
                      }}
                      error={vitals.bp.dbp && (parseInt(vitals.bp.dbp) < 0 || parseInt(vitals.bp.dbp) > 200)}
                      helperText={vitals.bp.dbp && (parseInt(vitals.bp.dbp) < 0 || parseInt(vitals.bp.dbp) > 200) ? 'Rango: 0-200' : ''}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField 
                    label="FC" 
                    size="small" 
                    type="number"
                    value={vitals.hr} 
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 220)) {
                        setVitals({...vitals, hr: value});
                      }
                    }}
                    InputProps={{ 
                      sx: { borderRadius: '12px' },
                      inputProps: { min: 0, max: 220, step: 1 }
                    }}
                    error={vitals.hr && (parseInt(vitals.hr) < 0 || parseInt(vitals.hr) > 220)}
                    helperText={vitals.hr && (parseInt(vitals.hr) < 0 || parseInt(vitals.hr) > 220) ? 'Rango: 0-220' : ''}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField 
                    label="FR" 
                    size="small" 
                    type="number"
                    value={vitals.fr} 
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 60)) {
                        setVitals({...vitals, fr: value});
                      }
                    }}
                    InputProps={{ 
                      sx: { borderRadius: '12px' },
                      inputProps: { min: 0, max: 60, step: 1 }
                    }}
                    error={vitals.fr && (parseInt(vitals.fr) < 0 || parseInt(vitals.fr) > 60)}
                    helperText={vitals.fr && (parseInt(vitals.fr) < 0 || parseInt(vitals.fr) > 60) ? 'Rango: 0-60' : ''}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField 
                    label="Temp" 
                    size="small" 
                    type="number"
                    value={vitals.temp} 
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d.]/g, '');
                      if (value === '' || (parseFloat(value) >= 30 && parseFloat(value) <= 45)) {
                        setVitals({...vitals, temp: value});
                      }
                    }}
                    InputProps={{ 
                      sx: { borderRadius: '12px' },
                      inputProps: { min: 30, max: 45, step: 0.1 }
                    }}
                    error={vitals.temp && (parseFloat(vitals.temp) < 30 || parseFloat(vitals.temp) > 45)}
                    helperText={vitals.temp && (parseFloat(vitals.temp) < 30 || parseFloat(vitals.temp) > 45) ? 'Rango: 30-45°C' : ''}
                  />
                </Grid>
              </Grid>

              <TextField 
                label="Nota de evolución" 
                multiline 
                rows={4} 
                fullWidth 
                placeholder="Escribe la valoración clínica..." 
                value={note} 
                onChange={(e) => {
                  const text = e.target.value;
                  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
                  if (wordCount <= 2000) {
                    setNote(text);
                  }
                }}
                sx={{ mb: 2 }} 
                InputProps={{ sx: { borderRadius: '12px' } }}
                helperText={`${note.trim() ? note.trim().split(/\s+/).length : 0} / 2000 palabras`}
                error={note.trim() && note.trim().split(/\s+/).length > 2000}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                <ActionButton onClick={handleSaveNote} startIcon={<SaveIcon />}>Guardar</ActionButton>
              </Box>

              <Divider sx={{ mb: 2 }} />
              <SectionTitle variant="h6" sx={{ fontSize: '1rem' }}><AccessTimeIcon className="icon" sx={{ fontSize: '1.2rem' }} /> Historial de sesión</SectionTitle>
              
              <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '300px' }}>
                <List>
                  {sessionHistory.map((h) => (
                    <ListItem key={h.id} sx={{ bgcolor: '#f8f9fa', borderRadius: '12px', mb: 1 }}>
                      <ListItemText primary={<Typography variant="subtitle2" fontWeight="bold" color="#2f84e4">{h.type === 'MED' ? 'Medicación' : 'Nota'}</Typography>} secondary={<>{h.text} <Typography component="span" variant="caption" display="block">{h.time}</Typography></>} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </ClinicalCard>
          </Grid>

          {/* RIGHT COL: MAR */}
          <Grid item xs={12} md={4}>
            <ClinicalCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <SectionTitle variant="h6" sx={{ mb: 0 }}><LocalPharmacyIcon className="icon" /> Plan</SectionTitle>
                <IconButton onClick={() => setShowAddMedicine(true)} sx={{ bgcolor: '#10b981', color: 'white', '&:hover': { bgcolor: '#059669' } }}><AddIcon /></IconButton>
              </Box>

              <Stack spacing={2}>
                {patient.medications.map((med) => (
                  <Paper key={med.id} elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: med.status === 'given' ? 'success.light' : 'divider', bgcolor: med.status === 'given' ? '#f0fbf5' : '#fff' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">{med.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{med.dose} • {med.route} • {med.freq}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {med.status === 'given' && <CheckCircleIcon color="success" />}
                        {currentUser?.is_superuser && (
                          <Tooltip title="Editar medicamento">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditMedicineOpen(med)} 
                              sx={{ color: '#3b82f6' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <IconButton size="small" onClick={() => handleDeleteMedicine(med.id)} sx={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2 }}>
                      {med.status === 'given' ? (
                        <Box textAlign="right">
                            <Typography variant="caption" color="success.main" fontWeight="bold">Administrado</Typography>
                            {/* If available from backend update */}
                            {med.last_history && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                    Por: {med.last_history.administered_by}
                                </Typography>
                            )}
                        </Box>
                      ) : (
                        <ActionButton size="small" onClick={() => handleAdminister(med.id)}>Administrar</ActionButton>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </ClinicalCard>
          </Grid>
        </Grid>

        {/* --- MODALS (Simplified for brevity, ensure you hook up state) --- */}
        
        {/* Add Medicine Modal */}
        <Modal open={showAddMedicine} onClose={() => setShowAddMedicine(false)} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 300 } }}>
          <Fade in={showAddMedicine}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', borderRadius: 4, p: 4 }}>
                <Typography variant="h6" mb={2}>Agregar Medicamento</Typography>
                <Stack spacing={2}>
                    <Autocomplete
                      freeSolo
                      options={medicineHistory.names}
                      value={newMedicine.name}
                      onInputChange={(event, newValue) => {
                        setNewMedicine({...newMedicine, name: newValue});
                      }}
                      onChange={(event, newValue) => {
                        setNewMedicine({...newMedicine, name: newValue || ''});
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params}
                          label="Nombre" 
                          fullWidth 
                          required
                          error={!newMedicine.name || !newMedicine.name.trim()}
                          helperText={(!newMedicine.name || !newMedicine.name.trim()) ? 'El nombre del medicamento es requerido' : 'Escriba o seleccione de anteriores'}
                        />
                      )}
                    />
                    <Autocomplete
                      freeSolo
                      options={medicineHistory.doses}
                      value={newMedicine.dose}
                      onInputChange={(event, newValue) => {
                        setNewMedicine({...newMedicine, dose: newValue});
                      }}
                      onChange={(event, newValue) => {
                        setNewMedicine({...newMedicine, dose: newValue || ''});
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params}
                          label="Dosis" 
                          fullWidth 
                          required
                          error={!newMedicine.dose || !newMedicine.dose.trim()}
                          helperText={(!newMedicine.dose || !newMedicine.dose.trim()) ? 'La dosis es requerida' : 'Escriba o seleccione de anteriores'}
                        />
                      )}
                    />
                    <TextField 
                      select
                      label="Vía" 
                      fullWidth 
                      value={newMedicine.route} 
                      onChange={(e) => setNewMedicine({...newMedicine, route: e.target.value})}
                      SelectProps={{ native: true }}
                    >
                      <option value="VO">Vía Oral</option>
                      <option value="IV">Intravenoso</option>
                      <option value="IM">Intramuscular</option>
                      <option value="SC">Subcutáneo</option>
                      <option value="TOP">Tópico</option>
                    </TextField>
                    <Autocomplete
                      freeSolo
                      options={medicineHistory.frequencies}
                      value={newMedicine.freq}
                      onInputChange={(event, newValue) => {
                        setNewMedicine({...newMedicine, freq: newValue});
                      }}
                      onChange={(event, newValue) => {
                        setNewMedicine({...newMedicine, freq: newValue || ''});
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params}
                          label="Frecuencia" 
                          fullWidth 
                          required
                          error={!newMedicine.freq || !newMedicine.freq.trim()}
                          helperText={(!newMedicine.freq || !newMedicine.freq.trim()) ? 'La frecuencia es requerida' : 'Escriba o seleccione de anteriores (ej: Cada 8 horas, 2 veces al día)'}
                        />
                      )}
                    />
                    <Button 
                      variant="contained" 
                      onClick={handleAddMedicine}
                      disabled={!newMedicine.name?.trim() || !newMedicine.dose?.trim() || !newMedicine.freq?.trim()}
                    >
                      Guardar
                    </Button>
                </Stack>
            </Box>
          </Fade>
        </Modal>

        {/* Edit Medicine Modal */}
        <Modal open={showEditMedicineModal} onClose={() => {
          setShowEditMedicineModal(false);
          setEditingMedicine(null);
        }} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 300 } }}>
          <Fade in={showEditMedicineModal}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', borderRadius: 4, p: 4 }}>
                <Typography variant="h6" mb={2}>Editar Medicamento</Typography>
                {editingMedicine && (
                  <Stack spacing={2}>
                      <Autocomplete
                        freeSolo
                        options={medicineHistory.names}
                        value={editingMedicine.name}
                        onInputChange={(event, newValue) => {
                          setEditingMedicine({...editingMedicine, name: newValue});
                        }}
                        onChange={(event, newValue) => {
                          setEditingMedicine({...editingMedicine, name: newValue || ''});
                        }}
                        renderInput={(params) => (
                          <TextField 
                            {...params}
                            label="Nombre" 
                            fullWidth 
                            required
                            error={!editingMedicine.name || !editingMedicine.name.trim()}
                            helperText={(!editingMedicine.name || !editingMedicine.name.trim()) ? 'El nombre del medicamento es requerido' : 'Escriba o seleccione de anteriores'}
                          />
                        )}
                      />
                      <Autocomplete
                        freeSolo
                        options={medicineHistory.doses}
                        value={editingMedicine.dose}
                        onInputChange={(event, newValue) => {
                          setEditingMedicine({...editingMedicine, dose: newValue});
                        }}
                        onChange={(event, newValue) => {
                          setEditingMedicine({...editingMedicine, dose: newValue || ''});
                        }}
                        renderInput={(params) => (
                          <TextField 
                            {...params}
                            label="Dosis" 
                            fullWidth 
                            required
                            error={!editingMedicine.dose || !editingMedicine.dose.trim()}
                            helperText={(!editingMedicine.dose || !editingMedicine.dose.trim()) ? 'La dosis es requerida' : 'Escriba o seleccione de anteriores'}
                          />
                        )}
                      />
                      <TextField 
                        select
                        label="Vía" 
                        fullWidth 
                        value={editingMedicine.route} 
                        onChange={(e) => setEditingMedicine({...editingMedicine, route: e.target.value})}
                        SelectProps={{ native: true }}
                      >
                        <option value="VO">Vía Oral</option>
                        <option value="IV">Intravenoso</option>
                        <option value="IM">Intramuscular</option>
                        <option value="SC">Subcutáneo</option>
                        <option value="TOP">Tópico</option>
                      </TextField>
                      <Autocomplete
                        freeSolo
                        options={medicineHistory.frequencies}
                        value={editingMedicine.freq}
                        onInputChange={(event, newValue) => {
                          setEditingMedicine({...editingMedicine, freq: newValue});
                        }}
                        onChange={(event, newValue) => {
                          setEditingMedicine({...editingMedicine, freq: newValue || ''});
                        }}
                        renderInput={(params) => (
                          <TextField 
                            {...params}
                            label="Frecuencia" 
                            fullWidth 
                            required
                            error={!editingMedicine.freq || !editingMedicine.freq.trim()}
                            helperText={(!editingMedicine.freq || !editingMedicine.freq.trim()) ? 'La frecuencia es requerida' : 'Escriba o seleccione de anteriores'}
                          />
                        )}
                      />
                      <Stack direction="row" spacing={2}>
                        <Button 
                          variant="outlined" 
                          onClick={() => {
                            setShowEditMedicineModal(false);
                            setEditingMedicine(null);
                          }}
                          fullWidth
                        >
                          Cancelar
                        </Button>
                        <Button 
                          variant="contained" 
                          onClick={handleUpdateMedicine}
                          disabled={updatingMedicine || !editingMedicine.name?.trim() || !editingMedicine.dose?.trim() || !editingMedicine.freq?.trim()}
                          fullWidth
                        >
                          {updatingMedicine ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={16} color="inherit" />
                              Actualizando...
                            </Box>
                          ) : (
                            'Guardar Cambios'
                          )}
                        </Button>
                      </Stack>
                  </Stack>
                )}
            </Box>
          </Fade>
        </Modal>

        {/* Discharge Modal */}
        <Modal open={showDischargeConfirm} onClose={() => setShowDischargeConfirm(false)} closeAfterTransition slots={{ backdrop: Backdrop }}>
            <Fade in={showDischargeConfirm}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', borderRadius: 4, p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" color="error" fontWeight="bold" gutterBottom>Dar de Alta</Typography>
                    <Typography mb={3}>¿Confirma que desea dar de alta al paciente {patient.name}?</Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button variant="outlined" onClick={() => setShowDischargeConfirm(false)}>Cancelar</Button>
                        <Button variant="contained" color="error" onClick={handleDischargePatient}>Confirmar</Button>
                    </Stack>
                </Box>
            </Fade>
        </Modal>

        {/* Kardex (Medication History) Modal */}
        <Modal open={showMedHistory} onClose={() => setShowMedHistory(false)} closeAfterTransition slots={{ backdrop: Backdrop }}>
            <Fade in={showMedHistory}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 900, bgcolor: 'background.paper', borderRadius: 4, maxHeight: '80vh', overflow: 'auto', p: 4 }}>
                    <Typography variant="h5" mb={3} fontWeight="bold">Kardex</Typography>
                    {patient.medications.length === 0 ? (
                        <Typography>No hay medicación registrada.</Typography>
                    ) : (
                        <List>
                            {patient.medications.map((med) => (
                                <ListItem key={med.id} divider>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {med.name} • {med.dose} • {med.route} • {med.freq}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="caption" display="block">
                                                    Estado: {med.status === 'given' ? 'Administrado' : med.status === 'due' ? 'Pendiente' : med.status}
                                                </Typography>
                                                {med.last_history && (
                                                    <Typography variant="caption" display="block">
                                                        Por: {med.last_history.administered_by} • {new Date(med.last_history.administered_at).toLocaleString()}
                                                    </Typography>
                                                )}
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Fade>
        </Modal>

        {/* Notes History Modal - Visualizing REAL data from patient.medicalNotes */}
        <Modal open={showNotesHistory} onClose={() => setShowNotesHistory(false)} closeAfterTransition slots={{ backdrop: Backdrop }}>
            <Fade in={showNotesHistory}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 1000, bgcolor: 'background.paper', borderRadius: 4, maxHeight: '80vh', overflow: 'auto', p: 4 }}>
                    <Typography variant="h5" mb={3} fontWeight="bold">Historial de Notas</Typography>
                    {/* Reuse your calendar logic here, but filter `patient.medicalNotes` instead of MOCK */}
                    {patient.medicalNotes.length === 0 ? <Typography>No hay notas registradas.</Typography> : (
                        <List>
                            {patient.medicalNotes.map(n => (
                                <ListItem 
                                    key={n.id} 
                                    divider
                                    secondaryAction={
                                        canEditNote(n) ? (
                                            <IconButton 
                                                edge="end" 
                                                onClick={() => handleStartEditNote(n)}
                                                sx={{ color: 'primary.main' }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        ) : null
                                    }
                                >
                                    {editingNote === n.id ? (
                                        <Box sx={{ width: '100%' }}>
                                            <TextField
                                                fullWidth
                                                label="Título"
                                                value={editNoteTitle}
                                                onChange={(e) => setEditNoteTitle(e.target.value)}
                                                sx={{ mb: 2 }}
                                            />
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                label="Contenido"
                                                value={editNoteContent}
                                                onChange={(e) => setEditNoteContent(e.target.value)}
                                                sx={{ mb: 2 }}
                                            />
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                <Button onClick={handleCancelEditNote} variant="outlined">
                                                    Cancelar
                                                </Button>
                                                <Button onClick={handleSaveEditNote} variant="contained" color="primary">
                                                    Guardar
                                                </Button>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <ListItemText 
                                            primary={n.title} 
                                            secondary={
                                                <>
                                                    <Typography variant="caption" display="block">{new Date(n.created_at).toLocaleString()}</Typography>
                                                    <Typography variant="body2">{n.content}</Typography>
                                                    <Typography variant="caption" color="primary">Dr. {n.created_by_username || n.doctor_name}</Typography>
                                                    {n.edit_history && n.edit_history.length > 0 && (
                                                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                                                            Editado {n.edit_history.length} vez(es)
                                                        </Typography>
                                                    )}
                                                </>
                                            } 
                                        />
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Fade>
        </Modal>

        {/* Edit Patient Modal */}
        <Modal
          open={showEditPatientModal}
          onClose={() => {
            setShowEditPatientModal(false);
            setEditingPatient(null);
          }}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: { timeout: 500, sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' } },
          }}
        >
          <Fade in={showEditPatientModal}>
            <Box
              sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '90%', md: 700 }, maxHeight: '90vh',
                bgcolor: 'background.paper', borderRadius: '24px',
                boxShadow: '0 32px 100px rgba(0,0,0,0.3)', overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', p: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
                    <EditIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>Editar Paciente</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Modifique los campos necesarios</Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => {
                  setShowEditPatientModal(false);
                  setEditingPatient(null);
                }} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, p: 1 }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Form Content */}
              {editingPatient && (
                <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Nombre completo" 
                        fullWidth 
                        required 
                        size="small"
                        value={editingPatient.nombre} 
                        onChange={handleEditPatientChange('nombre')} 
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Cédula de Ciudadanía (ID)" 
                        fullWidth 
                        required 
                        type="tel"
                        size="small"
                        value={editingPatient.cc} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 20) {
                            handleEditPatientChange('cc')({ target: { value } });
                          }
                        }}
                        inputProps={{ maxLength: 20 }}
                        error={editingPatient.cc && (editingPatient.cc.length < 7 || editingPatient.cc.length > 20)}
                        helperText={editingPatient.cc && (editingPatient.cc.length < 7 || editingPatient.cc.length > 20) 
                          ? '7-20 dígitos' 
                          : 'ID único (solo números)'}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Fecha de Nacimiento" 
                        fullWidth 
                        type="date"
                        size="small"
                        value={editingPatient.fechaNacimiento} 
                        onChange={handleEditPatientChange('fechaNacimiento')}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Edad" 
                        fullWidth 
                        type="number"
                        size="small"
                        value={editingPatient.edad} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 150)) {
                            handleEditPatientChange('edad')({ target: { value } });
                          }
                        }}
                        inputProps={{ min: 0, max: 150 }}
                        helperText="Se calcula automáticamente si hay fecha de nacimiento"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        select 
                        label="Género" 
                        fullWidth 
                        size="small"
                        value={editingPatient.genero} 
                        onChange={handleEditPatientChange('genero')}
                        SelectProps={{ native: true }}
                        sx={{ mb: 2 }}
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="EPS" 
                        fullWidth 
                        required 
                        size="small"
                        value={editingPatient.eps} 
                        onChange={handleEditPatientChange('eps')} 
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField 
                        label="Dirección" 
                        fullWidth 
                        size="small"
                        value={editingPatient.direccion} 
                        onChange={handleEditPatientChange('direccion')} 
                        InputProps={{ 
                          startAdornment: (<InputAdornment position="start"><HomeIcon color="action" /></InputAdornment>) 
                        }}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Alergias" 
                        fullWidth 
                        multiline 
                        rows={2}
                        size="small"
                        value={editingPatient.alergias} 
                        onChange={handleEditPatientChange('alergias')} 
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Diagnósticos" 
                        fullWidth 
                        multiline 
                        rows={2}
                        size="small"
                        value={editingPatient.diagnosticos} 
                        onChange={handleEditPatientChange('diagnosticos')} 
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Enfermedades Previas" 
                        fullWidth 
                        size="small"
                        value={editingPatient.enfermedadesPrevias} 
                        onChange={handleEditPatientChange('enfermedadesPrevias')} 
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Cirugías" 
                        fullWidth 
                        size="small"
                        value={editingPatient.cirugias} 
                        onChange={handleEditPatientChange('cirugias')} 
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Nombre del Acudiente" 
                        fullWidth 
                        size="small"
                        value={editingPatient.nombreAcudiente} 
                        onChange={handleEditPatientChange('nombreAcudiente')} 
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Teléfono del Acudiente" 
                        fullWidth 
                        type="tel"
                        size="small"
                        value={editingPatient.telefono} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 15) {
                            handleEditPatientChange('telefono')({ target: { value } });
                          }
                        }}
                        inputProps={{ maxLength: 15 }}
                        error={editingPatient.telefono && (editingPatient.telefono.length < 7 || editingPatient.telefono.length > 15)}
                        helperText={editingPatient.telefono && (editingPatient.telefono.length < 7 || editingPatient.telefono.length > 15) 
                          ? '7-15 dígitos' 
                          : 'Solo números'}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Footer */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#fafafa' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setShowEditPatientModal(false);
                      setEditingPatient(null);
                    }}
                    size="small"
                    sx={{ borderRadius: '10px', px: 3, py: 1, textTransform: 'none', fontWeight: 600 }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleUpdatePatient} 
                    size="small"
                    disabled={updatingPatient || !editingPatient?.nombre || !editingPatient?.cc || (!editingPatient?.fechaNacimiento && !editingPatient?.edad) || !editingPatient?.eps} 
                    sx={{ 
                      borderRadius: '10px', 
                      px: 3, 
                      py: 1, 
                      textTransform: 'none', 
                      fontWeight: 600, 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', 
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)'
                      }, 
                      '&:disabled': { 
                        background: '#e0e0e0', 
                        boxShadow: 'none',
                        color: '#9e9e9e'
                      } 
                    }}
                  >
                    {updatingPatient ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} color="inherit" />
                        Actualizando...
                      </Box>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={4000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity} 
            sx={{ width: '100%', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Container>
    </Box>
  );
}

export default ClinicalDashboard;