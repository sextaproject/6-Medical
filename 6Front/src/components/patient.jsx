import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Typography, styled, 
  Paper, Container, Box, Grid, Button, TextField, Chip, Stack, Divider, List, ListItem, ListItemText, Avatar, MenuItem, IconButton, Modal, Fade, Backdrop} from '@mui/material';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Tooltip from '@mui/material/Tooltip';

// Patient avatar images
import maleAvatar1 from '../assets/m1.png';
import maleAvatar2 from '../assets/m2.png';
import maleAvatar3 from '../assets/m3.png';
import femaleAvatar1 from '../assets/f1.png';
import femaleAvatar2 from '../assets/f2.png';

const MALE_AVATARS = [maleAvatar1, maleAvatar2, maleAvatar3];
const FEMALE_AVATARS = [femaleAvatar1, femaleAvatar2];

// --- MOCK DATA ---
const INITIAL_PATIENT = {
  id: 1,
  name: "Robert Fox",
  age: 64,
  diagnosis: "DIAGNOSTICO",
  admissionDate: "2023-11-01",
  room: "101-A",
  allergies: "Penicilina",
  genero: "Masculino",
  diet: "Dieta Normal",
  medications: [
    { id: 'm1', name: 'Pregabalina', dose: '1g', route: 'IV', freq: 'Diario', status: 'due' },
    { id: 'm2', name: 'Acetaminofen', dose: '500mg', route: 'VO', freq: '6 horas', status: 'due' },
    { id: 'm3', name: 'Ensure', dose: '1 vaso', route: 'VO', freq: '3 comidas', status: 'available' }
  ]
};

const DIET_OPTIONS = [
  "Dieta Normal",
  "Dieta Blanda",
  "Dieta Hiperprteica",
  "No Papaya",
];

// Generate mock medication history for the past weeks
const generateMockMedHistory = () => {
  const meds = ['Ceftriaxone', 'Azithromycin', 'Acetaminophen', 'Pregabalina', 'Omeprazole'];
  const history = [];
  const now = new Date();
  
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    
    // Random 2-4 administrations per day
    const numAdmins = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numAdmins; i++) {
      const hour = 6 + Math.floor(Math.random() * 16); // 6am to 10pm
      const minute = Math.floor(Math.random() * 60);
      history.push({
        id: `hist-${dayOffset}-${i}`,
        medication: meds[Math.floor(Math.random() * meds.length)],
        dose: ['500mg', '1g', '250mg', '100mg'][Math.floor(Math.random() * 4)],
        route: ['IV', 'PO', 'IM'][Math.floor(Math.random() * 3)],
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute),
        administeredBy: ['Enf. García', 'Enf. López', 'Enf. Martínez'][Math.floor(Math.random() * 3)],
      });
    }
  }
  return history.sort((a, b) => b.date - a.date);
};

const MOCK_MED_HISTORY = generateMockMedHistory();

// Generate mock medical notes history
const generateMockNotesHistory = () => {
  const doctors = [
    { name: 'Dr. Carlos Mendoza', specialty: 'Medicina Interna' },
    { name: 'Dra. Ana Rodríguez', specialty: 'Cardiología' },
    { name: 'Dr. Luis Herrera', specialty: 'Neumología' },
    { name: 'Dra. Patricia Gómez', specialty: 'Geriatría' },
  ];
  
  const noteTypes = [
    { type: 'Evolución', notes: [
      { summary: 'Paciente estable, sin cambios significativos', fullText: 'Paciente se encuentra hemodinámicamente estable. Sin cambios significativos respecto a valoración previa. Continúa con tratamiento establecido. Tolera adecuadamente la vía oral. No presenta signos de alarma. Se mantiene plan terapéutico actual.' },
      { summary: 'Mejoría clínica notable, tolera vía oral', fullText: 'Se evidencia mejoría clínica notable en las últimas 24 horas. Paciente afebril, con mejor estado general. Tolera adecuadamente la vía oral sin náuseas ni vómitos. Herida quirúrgica sin signos de infección. Se considera egreso en próximos días si evolución continúa favorable.' },
      { summary: 'Presenta leve disnea, se ajusta oxígeno', fullText: 'Paciente refiere leve disnea de esfuerzo desde la madrugada. Saturación de oxígeno 92% al aire ambiente. Se incrementa aporte de oxígeno por cánula nasal a 3L/min con mejoría a 96%. Se solicitan gases arteriales de control. Mantener vigilancia estrecha de función respiratoria.' },
      { summary: 'Signos vitales estables, continúa tratamiento', fullText: 'Signos vitales dentro de parámetros normales. TA 120/80, FC 78 lpm, FR 18 rpm, Temp 36.5°C. Paciente consciente, orientado, colaborador. Sin dolor. Diuresis adecuada. Se continúa esquema antibiótico y demás medicamentos según protocolo establecido.' },
      { summary: 'Respuesta favorable al tratamiento antibiótico', fullText: 'Paciente muestra respuesta favorable al esquema antibiótico iniciado hace 72 horas. Leucocitos en descenso, de 15,000 a 9,500. PCR disminuye de 120 a 45. Afebril en las últimas 48 horas. Se completará esquema de 7 días. Pronóstico favorable.' },
    ]},
    { type: 'Interconsulta', notes: [
      { summary: 'Evaluación cardiológica solicitada', fullText: 'Se solicita valoración por cardiología dado antecedente de insuficiencia cardíaca y hallazgo de soplo sistólico grado II/VI en foco mitral. Paciente con disnea de medianos esfuerzos. ECG muestra ritmo sinusal con extrasístoles ventriculares ocasionales. Favor evaluar y dar recomendaciones.' },
      { summary: 'Valoración por neumología completada', fullText: 'Neumología valora paciente. Diagnóstico: EPOC reagudizado. Recomendaciones: Continuar broncodilatadores cada 6 horas, agregar corticoide sistémico por 5 días, nebulizaciones con solución salina TID. Terapia respiratoria diaria. Control en consulta externa en 2 semanas.' },
      { summary: 'Revisión de medicamentos recomendada', fullText: 'Farmacia clínica revisa esquema de medicamentos. Se identifican posibles interacciones entre metoprolol y verapamilo. Se recomienda suspender verapamilo y ajustar dosis de metoprolol. Verificar función renal antes de continuar con dosis actuales de antibiótico.' },
      { summary: 'Se sugiere ajuste de dosis', fullText: 'Nefrología evalúa paciente con TFG de 45 mL/min. Se recomienda ajuste de dosis de medicamentos de eliminación renal: Reducir enoxaparina a 40mg cada 24 horas. Ajustar metformina. Evitar AINEs. Control de creatinina en 48 horas.' },
    ]},
    { type: 'Orden médica', notes: [
      { summary: 'Se ordena nuevo esquema antibiótico', fullText: 'Dado resultado de cultivo con E. coli BLEE positivo, se modifica esquema antibiótico. Suspender ceftriaxona. Iniciar meropenem 1g IV cada 8 horas por 10 días. Continuar vigilancia de función renal y hepática. Nuevo cultivo de control al día 7.' },
      { summary: 'Cambio de dieta a blanda', fullText: 'Paciente con buena tolerancia a líquidos claros en últimas 24 horas. Se progresa dieta a blanda, fraccionada en 5 tomas. Evitar lácteos, grasas y condimentos. Si tolera bien, progresar a dieta normal en 48 horas. Valorar con nutrición si no hay progreso.' },
      { summary: 'Solicitud de laboratorios de control', fullText: 'Se ordenan exámenes de control para mañana: Hemograma completo, PCR, procalcitonina, función renal (BUN, creatinina), electrolitos, función hepática, tiempos de coagulación. Gases arteriales si persiste disnea. Resultados para revista médica de las 8:00.' },
      { summary: 'Inicio de terapia respiratoria', fullText: 'Se ordena inicio de terapia respiratoria: Ejercicios de expansión pulmonar TID, incentivo respiratorio cada 2 horas durante el día, drenaje postural según tolerancia, movilización temprana asistida. Objetivo: Prevenir atelectasias y complicaciones respiratorias postoperatorias.' },
    ]},
  ];
  
  const notes = [];
  const now = new Date();
  
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    
    // 1-3 notes per day
    const numNotes = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numNotes; i++) {
      const hour = 7 + Math.floor(Math.random() * 12);
      const minute = Math.floor(Math.random() * 60);
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const noteType = noteTypes[Math.floor(Math.random() * noteTypes.length)];
      const noteContent = noteType.notes[Math.floor(Math.random() * noteType.notes.length)];
      
      notes.push({
        id: `note-${dayOffset}-${i}`,
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute),
        doctor: doctor.name,
        specialty: doctor.specialty,
        type: noteType.type,
        summary: noteContent.summary,
        fullText: noteContent.fullText,
      });
    }
  }
  return notes.sort((a, b) => b.date - a.date);
};

const MOCK_NOTES_HISTORY = generateMockNotesHistory();

// Time slots for the calendar grid
const TIME_SLOTS = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

// --- STYLED COMPONENTS (Based on your template) ---

const CommonBackground = styled(Box)(({ theme }) => ({
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: '#f4f6f8', // Light gray standard background
  backgroundImage: `linear-gradient(#2f84e4 1px, transparent 1px), linear-gradient(90deg, #2f84e4 1px, transparent 1px)`,
  backgroundSize: '40px 40px', 
  opacity: 0.05, 
  pointerEvents: 'none', 
  zIndex: -1,
}));

// Adapted ServiceCard to be a content container
const ClinicalCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '20px', 
  backgroundColor: '#ffffff',
  border: `1px solid rgba(0, 0, 0, 0.08)`, 
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(47, 132, 228, 0.15)', 
    borderColor: '#2f84e4',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  backgroundColor:'#2f84e4', 
  color: '#fff', 
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  boxShadow: '0 4px 12px rgba(47, 132, 228, 0.3)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#1e5fba', 
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(47, 132, 228, 0.4)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: '#1a2027',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& .icon': {
    color: '#2f84e4',
  }
}));

// --- MAIN COMPONENT ---

function ClinicalDashboard() {
  const location = useLocation();
  const incomingPatient = location.state?.patient;
  const incomingPatientsList = location.state?.patients;

  const [patient, setPatient] = useState(() => incomingPatient ? {
    ...INITIAL_PATIENT,
    ...incomingPatient,
    diet: incomingPatient.diet ?? INITIAL_PATIENT.diet,
    medications: incomingPatient.medications ?? INITIAL_PATIENT.medications,
  } : INITIAL_PATIENT);
  const [vitals, setVitals] = useState({ bp: { sbp: '', dbp: '' }, hr: '', fr: '',  temp: '' });
  const [note, setNote] = useState('');
  const [history, setHistory] = useState([]);
  const [showMedHistory, setShowMedHistory] = useState(false);
  const [showNotesHistory, setShowNotesHistory] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [notesWeekOffset, setNotesWeekOffset] = useState(0);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [newMedicine, setNewMedicine] = useState({ name: '', dose: '', route: 'VO', freq: '' });
  const [showDischargeConfirm, setShowDischargeConfirm] = useState(false);

  useEffect(() => {
    if (incomingPatient) {
      setPatient(prev => ({
        ...prev,
        ...incomingPatient,
        diet: incomingPatient.diet ?? INITIAL_PATIENT.diet,
        medications: incomingPatient.medications ?? INITIAL_PATIENT.medications,
        isDischarged: incomingPatient.isDischarged ?? false,
      }));
      setHistory([]);
    }
  }, [incomingPatient]);

  const orderedPatients = React.useMemo(() => {
    if (Array.isArray(incomingPatientsList) && incomingPatientsList.length) {
      return [...incomingPatientsList].sort((a, b) => {
        const toNum = (id) => parseInt(String(id).replace(/\D+/g, ''), 10) || 0;
        return toNum(a.id) - toNum(b.id);
      });
    }
    return null;
  }, [incomingPatientsList]);

  const currentIndex = orderedPatients
    ? orderedPatients.findIndex((p) => p.id === patient.id)
    : -1;

  const goToPatient = (direction) => {
    if (!orderedPatients || orderedPatients.length === 0) return;
    let nextIndex = currentIndex + direction;
    // Circular navigation: wrap around
    if (nextIndex < 0) {
      nextIndex = orderedPatients.length - 1; // Go to last
    } else if (nextIndex >= orderedPatients.length) {
      nextIndex = 0; // Go to first
    }
    const nextPatient = orderedPatients[nextIndex];
    setPatient({
      ...INITIAL_PATIENT,
      ...nextPatient,
      diet: nextPatient.diet ?? INITIAL_PATIENT.diet,
      medications: nextPatient.medications ?? INITIAL_PATIENT.medications,
    });
    setVitals({ bp: { sbp: '', dbp: '' }, hr: '', fr: '', temp: '' });
    setHistory([]);
  };

  // Calculate Days
  const getDaysAdmitted = (dateString) => {
    const start = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Actions
  const handleAdminister = (medId) => {
    const med = patient.medications.find(m => m.id === medId);
    setPatient(prev => ({
      ...prev,
      medications: prev.medications.map(m => m.id === medId ? { ...m, status: 'given', givenTime: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) } : m)
    }));
    addToHistory('MED', `Administrado ${med.name} (${med.dose})`);
  };

  const handleSaveNote = () => {
    if (!note && !vitals.bp.sbp && !vitals.bp.dbp && !vitals.hr && !vitals.fr && !vitals.temp) return;
    const vitalsParts = [];
    if (vitals.bp.sbp || vitals.bp.dbp) vitalsParts.push(`PA:${vitals.bp.sbp || '--'}/${vitals.bp.dbp || '--'}`);
    if (vitals.hr) vitalsParts.push(`FC:${vitals.hr}`);
    if (vitals.fr) vitalsParts.push(`FR:${vitals.fr}`);
    if (vitals.temp) vitalsParts.push(`Temp:${vitals.temp}`);
    const vitalsStr = vitalsParts.join(' ');
    addToHistory('NOTE', `${vitalsStr} \n${note}`);
    setVitals({ bp: { sbp: '', dbp: '' }, hr: '', fr: '', temp: '' });
    setNote('');
  };

  const addToHistory = (type, text) => {
    setHistory(prev => [{
      id: Date.now(),
      type,
      text,
      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    }, ...prev]);
  };

  const handleDietChange = (event) => {
    const value = event.target.value;
    setPatient(prev => ({ ...prev, diet: value }));
    addToHistory('NOTE', `Dieta actualizada: ${value}`);
  };

  const handleAddMedicine = () => {
    if (!newMedicine.name || !newMedicine.dose || !newMedicine.freq) return;
    const newMed = {
      id: `m${Date.now()}`,
      name: newMedicine.name,
      dose: newMedicine.dose,
      route: newMedicine.route,
      freq: newMedicine.freq,
      status: 'due'
    };
    setPatient(prev => ({
      ...prev,
      medications: [...prev.medications, newMed]
    }));
    addToHistory('NOTE', `Nuevo medicamento agregado: ${newMedicine.name} ${newMedicine.dose} ${newMedicine.freq}`);
    setNewMedicine({ name: '', dose: '', route: 'VO', freq: '' });
    setShowAddMedicine(false);
  };

  const handleDeleteMedicine = (medId) => {
    const med = patient.medications.find(m => m.id === medId);
    setPatient(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== medId)
    }));
    addToHistory('NOTE', `Medicamento eliminado: ${med.name}`);
  };

  const handleDischargePatient = () => {
    setPatient(prev => ({ ...prev, isDischarged: true }));
    setShowDischargeConfirm(false);
    addToHistory('NOTE', `Paciente dado de alta`);
  };

  const handleReadmitPatient = () => {
    setPatient(prev => ({ ...prev, isDischarged: false }));
    addToHistory('NOTE', `Paciente readmitido`);
  };

  const getGenderMeta = (genero, patientId) => {
    const isFemale = genero?.toLowerCase() === 'femenino';
    // Use patient id to consistently pick an avatar
    const idNum = typeof patientId === 'number' ? patientId : parseInt(String(patientId).replace(/\D+/g, ''), 10) || 0;
    const avatars = isFemale ? FEMALE_AVATARS : MALE_AVATARS;
    const avatarIndex = idNum % avatars.length;
    return {
      isFemale,
      color: isFemale ? '#e91e63' : '#2f84e4',
      avatar: avatars[avatarIndex],
    };
  };

  const genderMeta = getGenderMeta(patient.genero, patient.id);

  // Weekly calendar logic
  const getWeekDays = (offset = 0) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (offset * 7)); // Start from Monday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);

  const getMedsForSlot = (day, timeSlot) => {
    const [hour] = timeSlot.split(':').map(Number);
    return MOCK_MED_HISTORY.filter(med => {
      const medDate = med.date;
      return medDate.getDate() === day.getDate() &&
             medDate.getMonth() === day.getMonth() &&
             medDate.getFullYear() === day.getFullYear() &&
             medDate.getHours() >= hour && medDate.getHours() < hour + 2;
    });
  };

  const formatWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
  };

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Notes weekly calendar logic
  const notesWeekDays = useMemo(() => getWeekDays(notesWeekOffset), [notesWeekOffset]);

  const getNotesForDay = (day) => {
    return MOCK_NOTES_HISTORY.filter(note => {
      const noteDate = note.date;
      return noteDate.getDate() === day.getDate() &&
             noteDate.getMonth() === day.getMonth() &&
             noteDate.getFullYear() === day.getFullYear();
    });
  };

  const formatNotesWeekRange = () => {
    const start = notesWeekDays[0];
    const end = notesWeekDays[6];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', py: 4, overflowX: 'hidden' }}>
      <CommonBackground />
      
      <Container
        maxWidth={false}
        sx={{
          px: { xs: 2, md: 4 },
          maxWidth: '1800px',
          mx: 'auto',
        }}
      >
        
        {/* HEADER SECTION */}
        <ClinicalCard
          sx={{
            mb: 3,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 4,
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* Left hover zone for previous arrow */}
          <Box
            sx={{
              position: 'absolute',
              left: -40,
              top: 0,
              bottom: 0,
              width: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              zIndex: 10,
              '&:hover .nav-arrow-left': { opacity: 1 },
          }}
        >
          <IconButton
            aria-label="Paciente anterior"
            onClick={() => goToPatient(-1)}
              disabled={!orderedPatients || orderedPatients.length <= 1}
            sx={{
                bgcolor: 'rgba(255,255,255,0.95)',
              color: 'text.primary',
              borderRadius: '50%',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              width: 40,
              height: 40,
              opacity: 0,
                transition: 'opacity 0.2s ease, background-color 0.2s ease',
                '&:hover': { bgcolor: '#2f84e4', color: '#fff' },
                '&.Mui-disabled': { opacity: 0, pointerEvents: 'none' },
              }}
              className="nav-arrow-left"
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar 
              src={genderMeta.avatar} 
              sx={{ 
                width: 80, 
                height: 80, 
              }} 
            />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" fontWeight="800" color={genderMeta.color}>
                  {patient.name}
                </Typography>
                {patient.isDischarged && (
                  <Chip 
                    label="DADO DE ALTA" 
                    sx={{ 
                      bgcolor: '#10b981', 
                      color: 'white', 
                      fontWeight: 'bold',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
                      },
                    }} 
                  />
                )}
              </Box>
              <Chip 
                label={patient.diagnosis} 
                color="primary" 
                variant="outlined" 
                size="small" 
                sx={{ borderColor: '#2f84e4', color: '#2f84e4', fontWeight: 'bold' }} 
              />
              <Stack direction="row" spacing={2} sx={{ mt: 1 }} alignItems="center">
                <Typography variant="body1" fontWeight="500" color="text.secondary">
                  EDAD: {patient.age} años • CAMA: {patient.room} • CC: {patient.cc} • EPS: {patient.eps}
                </Typography>
              </Stack>
            </Box>
          </Box>

          {/* History Buttons Container */}
          <Stack direction="row" spacing={2}>
            {/* Medical Notes History Button */}
            <Box
              onClick={() => setShowNotesHistory(true)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                p: 1.5,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(16, 185, 129, 0.08)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: 52,
                  height: 52,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                }}
              >
                <DescriptionIcon sx={{ color: 'white', fontSize: 26 }} />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                  }}
                >
                  <HistoryIcon sx={{ color: 'white', fontSize: 11 }} />
                </Box>
              </Box>
              <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.65rem' }}>
                Notas Médicas
              </Typography>
            </Box>

            {/* Medication History Button */}
            <Box
              onClick={() => setShowMedHistory(true)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                p: 1.5,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(47, 132, 228, 0.08)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: 52,
                  height: 52,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #2f84e4 0%, #1e5fba 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(47, 132, 228, 0.35)',
                }}
              >
                <LocalPharmacyIcon sx={{ color: 'white', fontSize: 26 }} />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                  }}
                >
                  <CalendarMonthIcon sx={{ color: 'white', fontSize: 11 }} />
                </Box>
              </Box>
              <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.65rem' }}>
                Medicación
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
               <Typography variant="h3" fontWeight="800" color="text.primary">
                 {getDaysAdmitted(patient.admissionDate)}
               </Typography>
               <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 1 }}>
                 DÍAS ESTANCIA
               </Typography>
            </Box>
            
            {/* Discharge Button */}
            <Tooltip title={patient.isDischarged ? "Readmitir paciente" : "Dar de alta"} arrow>
              <IconButton
                onClick={() => patient.isDischarged ? handleReadmitPatient() : setShowDischargeConfirm(true)}
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: patient.isDischarged ? '#10b981' : '#ef4444',
                  color: 'white',
                  boxShadow: patient.isDischarged 
                    ? '0 4px 14px rgba(16, 185, 129, 0.4)' 
                    : '0 4px 14px rgba(239, 68, 68, 0.4)',
                  '&:hover': { 
                    bgcolor: patient.isDischarged ? '#059669' : '#dc2626',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ExitToAppIcon sx={{ fontSize: 26, transform: patient.isDischarged ? 'rotate(180deg)' : 'none' }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Right hover zone for next arrow */}
          <Box
            sx={{
              position: 'absolute',
              right: -40,
              top: 0,
              bottom: 0,
              width: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              zIndex: 10,
              '&:hover .nav-arrow-right': { opacity: 1 },
            }}
          >
          <IconButton
            aria-label="Paciente siguiente"
            onClick={() => goToPatient(1)}
              disabled={!orderedPatients || orderedPatients.length <= 1}
            sx={{
                bgcolor: 'rgba(255,255,255,0.95)',
              color: 'text.primary',
              borderRadius: '50%',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              width: 40,
              height: 40,
              opacity: 0,
                transition: 'opacity 0.2s ease, background-color 0.2s ease',
                '&:hover': { bgcolor: '#2f84e4', color: '#fff' },
                '&.Mui-disabled': { opacity: 0, pointerEvents: 'none' },
              }}
              className="nav-arrow-right"
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
          </Box>
        </ClinicalCard>

        {/* MAIN GRID */}
        <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
          
          {/* LEFT COL: Nurse Station */}
          <Grid item xs={12} md={9.5} sx={{ flex: { md: '0 0 70%' }, maxWidth: { md: '70%' } }}>
            <ClinicalCard>
              <SectionTitle variant="h5">
                <MonitorHeartIcon className="icon" /> Signos Vitales
              </SectionTitle>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <TextField 
                        label="PAS" 
                        variant="outlined" 
                        size="small"
                        sx={{ width: 60 }}
                        value={vitals.bp.sbp}
                        onChange={(e) => setVitals({...vitals, bp: { ...vitals.bp, sbp: e.target.value.slice(0, 3) }})}
                        inputProps={{ maxLength: 3, inputMode: 'numeric', pattern: '[0-9]*' }}
                        InputProps={{ sx: { borderRadius: '12px' } }}
                      />
                      <Typography variant="h5" component="span" sx={{ mx: 0.5 }}>
                        /
                      </Typography>
                      <TextField 
                        label="PAD" 
                        variant="outlined" 
                        size="small"
                        sx={{ width: 60 }}
                        value={vitals.bp.dbp}
                        onChange={(e) => setVitals({...vitals, bp: { ...vitals.bp, dbp: e.target.value.slice(0, 3) }})}
                        inputProps={{ maxLength: 3, inputMode: 'numeric', pattern: '[0-9]*' }}
                        InputProps={{ sx: { borderRadius: '12px' } }}
                      />
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField 
                    label="FC (lpm)" 
                    variant="outlined" 
                    size="small"
                    sx={{ width: 80 }}
                    value={vitals.hr}
                    onChange={(e) => setVitals({...vitals, hr: e.target.value})}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField 
                    label="FR (rpm)" 
                    variant="outlined" 
                    size="small"
                    sx={{ width: 80 }}
                    value={vitals.fr}
                    onChange={(e) => setVitals({...vitals, fr: e.target.value})}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField 
                    label="Temp (°F)" 
                    variant="outlined" 
                    size="small"
                    sx={{ width: 80 }}
                    value={vitals.temp}
                    onChange={(e) => setVitals({...vitals, temp: e.target.value})}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Nota de evolución"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                placeholder="Escribe la valoración clínica..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{ sx: { borderRadius: '12px' } }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                <ActionButton onClick={handleSaveNote} startIcon={<SaveIcon />}>
                  Guardar
                </ActionButton>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <SectionTitle variant="h6" sx={{ fontSize: '1rem' }}>
                <AccessTimeIcon className="icon" sx={{ fontSize: '1.2rem' }} /> Historial de turno
              </SectionTitle>
              
              <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '300px' }}>
                {history.filter(h => h.type === 'NOTE').length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4, fontStyle: 'italic' }}>
                    Sin notas registradas en este turno.
                  </Typography>
                ) : (
                  <List>
                    {history.filter(h => h.type === 'NOTE').map((h) => (
                      <ListItem key={h.id} sx={{ bgcolor: '#f8f9fa', borderRadius: '12px', mb: 1 }}>
                        <ListItemText 
                          primary={
                            <Typography variant="subtitle2" fontWeight="bold" color="#2f84e4">
                              Nota de enfermería
                            </Typography>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block', mt: 0.5 }}>
                                {h.text}
                              </Typography>
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {h.time}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </ClinicalCard>
          </Grid>

          {/* RIGHT COL: MAR */}
          <Grid item xs={12} md={4}>
            <ClinicalCard>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <SectionTitle variant="h6" sx={{ mb: 0 }}>
                <LocalPharmacyIcon className="icon" /> Plan
              </SectionTitle>
                <IconButton
                  onClick={() => setShowAddMedicine(true)}
                  sx={{
                    bgcolor: '#10b981',
                    color: 'white',
                    width: 36,
                    height: 36,
                    '&:hover': {
                      bgcolor: '#059669',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Dieta"
                  value={patient.diet || 'Dieta Normal'}
                  onChange={handleDietChange}
                  slotProps={{
                    select: {
                      MenuProps: { PaperProps: { style: { maxHeight: 240 } } },
                    },
                    input: {
                      sx: { borderRadius: '12px' },
                    },
                  }}
                >
                  {DIET_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Stack spacing={2}>
                {patient.medications.map((med) => (
                  <Paper 
                    key={med.id} 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      borderRadius: '16px', 
                      border: '1px solid',
                      borderColor: med.status === 'given' ? 'success.light' : 'divider',
                      bgcolor: med.status === 'given' ? '#f0fbf5' : '#fff',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {med.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {med.dose} • {med.route} • <Box component="span" sx={{ color: '#2f84e4', fontWeight: 'bold' }}>{med.freq}</Box>
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {med.status === 'given' && (
                          <CheckCircleIcon color="success" />
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteMedicine(med.id)}
                          sx={{
                            color: '#ef4444',
                            opacity: 0.6,
                            '&:hover': {
                              opacity: 1,
                              bgcolor: 'rgba(239, 68, 68, 0.1)',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2 }}>
                      {med.status === 'given' ? (
                        <Typography variant="caption" color="success.main" fontWeight="bold">
                          Administrado a las {med.givenTime}
                        </Typography>
                      ) : (
                        <ActionButton 
                          size="small" 
                          onClick={() => handleAdminister(med.id)}
                          sx={{ py: 0.5, px: 2, fontSize: '0.8rem' }}
                        >
                          Administrar
                        </ActionButton>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Stack>

            </ClinicalCard>
          </Grid>

        </Grid>

        {/* Medication History Modal */}
        <Modal
          open={showMedHistory}
          onClose={() => setShowMedHistory(false)}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
              sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }
            },
          }}
        >
          <Fade in={showMedHistory}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', md: '90%', lg: '85%' },
                maxWidth: 1200,
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                borderRadius: '24px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Modal Header */}
              <Box
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #2f84e4 0%, #1e5fba 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarMonthIcon sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={800}>
                      Historial de Medicación
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {patient.name} • Vista semanal
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  onClick={() => setShowMedHistory(false)}
                  sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Week Navigation */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  bgcolor: '#f8fafc',
                }}
              >
                <IconButton 
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  sx={{ 
                    bgcolor: 'white', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#2f84e4', color: 'white' }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={700} sx={{ minWidth: 200, textAlign: 'center' }}>
                  {formatWeekRange()}
                </Typography>
                <IconButton 
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  disabled={weekOffset >= 0}
                  sx={{ 
                    bgcolor: 'white', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#2f84e4', color: 'white' },
                    '&.Mui-disabled': { bgcolor: '#f0f0f0' }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>

              {/* Calendar Grid */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '80px repeat(7, 1fr)',
                    gap: 0.5,
                    minWidth: 800,
                  }}
                >
                  {/* Header Row */}
                  <Box sx={{ p: 1 }} /> {/* Empty corner */}
                  {weekDays.map((day, idx) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.5,
                          textAlign: 'center',
                          borderRadius: '12px',
                          bgcolor: isToday ? '#2f84e4' : '#f1f5f9',
                          color: isToday ? 'white' : 'text.primary',
                          transition: 'all 0.3s ease',
                          animation: isToday ? 'pulse 2s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%, 100%': { boxShadow: '0 0 0 0 rgba(47, 132, 228, 0.4)' },
                            '50%': { boxShadow: '0 0 0 8px rgba(47, 132, 228, 0)' },
                          },
                        }}
                      >
                        <Typography variant="caption" fontWeight={600} sx={{ opacity: 0.8 }}>
                          {dayNames[idx]}
                        </Typography>
                        <Typography variant="h6" fontWeight={800}>
                          {day.getDate()}
                        </Typography>
                      </Box>
                    );
                  })}

                  {/* Time Rows */}
                  {TIME_SLOTS.map((timeSlot, timeIdx) => (
                    <React.Fragment key={timeSlot}>
                      {/* Time Label */}
                      <Box
                        sx={{
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'text.secondary',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      >
                        {timeSlot}
                      </Box>

                      {/* Day Cells */}
                      {weekDays.map((day, dayIdx) => {
                        const meds = getMedsForSlot(day, timeSlot);
                        return (
                          <Box
                            key={`${timeSlot}-${dayIdx}`}
                            sx={{
                              minHeight: 60,
                              p: 0.5,
                              bgcolor: '#fafbfc',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: '#f1f5f9',
                                borderColor: '#cbd5e1',
                              },
                            }}
                          >
                            {meds.map((med, medIdx) => (
                              <Box
                                key={med.id}
                                sx={{
                                  p: 0.75,
                                  mb: 0.5,
                                  borderRadius: '6px',
                                  bgcolor: '#e0f2fe',
                                  borderLeft: '3px solid #2f84e4',
                                  fontSize: '0.7rem',
                                  animation: `slideIn 0.3s ease ${medIdx * 0.1}s both`,
                                  '@keyframes slideIn': {
                                    from: { opacity: 0, transform: 'translateX(-10px)' },
                                    to: { opacity: 1, transform: 'translateX(0)' },
                                  },
                                }}
                              >
                                <Typography 
                                  variant="caption" 
                                  fontWeight={700} 
                                  sx={{ display: 'block', color: '#0369a1', lineHeight: 1.2 }}
                                >
                                  {med.medication}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ color: 'text.secondary', fontSize: '0.65rem' }}
                                >
                                  {med.dose} • {med.route} • {med.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>

              {/* Modal Footer */}
              <Box
                sx={{
                  p: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#e0f2fe', border: '2px solid #2f84e4' }} />
                    <Typography variant="caption" color="text.secondary">Medicación administrada</Typography>
                  </Box>
                </Box>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowMedHistory(false)}
                  sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                  Cerrar
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* Medical Notes History Modal */}
        <Modal
          open={showNotesHistory}
          onClose={() => setShowNotesHistory(false)}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
              sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }
            },
          }}
        >
          <Fade in={showNotesHistory}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', md: '90%', lg: '85%' },
                maxWidth: 1200,
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                borderRadius: '24px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Modal Header */}
              <Box
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ position: 'relative' }}>
                    <DescriptionIcon sx={{ fontSize: 32 }} />
                    <HistoryIcon sx={{ fontSize: 14, position: 'absolute', bottom: -2, right: -4 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={800}>
                      Historial de Notas Médicas
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {patient.name} • Registro semanal
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  onClick={() => setShowNotesHistory(false)}
                  sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Week Navigation */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  bgcolor: '#f0fdf4',
                }}
              >
                <IconButton 
                  onClick={() => setNotesWeekOffset(prev => prev - 1)}
                  sx={{ 
                    bgcolor: 'white', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#10b981', color: 'white' }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={700} sx={{ minWidth: 200, textAlign: 'center' }}>
                  {formatNotesWeekRange()}
                </Typography>
                <IconButton 
                  onClick={() => setNotesWeekOffset(prev => prev + 1)}
                  disabled={notesWeekOffset >= 0}
                  sx={{ 
                    bgcolor: 'white', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#10b981', color: 'white' },
                    '&.Mui-disabled': { bgcolor: '#f0f0f0' }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>

              {/* Weekly Calendar Grid */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                <Box 
                  sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(7, 1fr)', 
                    gap: 2,
                    minWidth: 900,
                  }}
                >
                  {notesWeekDays.map((day, idx) => {
                    const notes = getNotesForDay(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <Box key={idx}>
                        <Box
                          sx={{
                            height: '100%',
                            minHeight: 280,
                            borderRadius: '16px',
                            border: isToday ? '2px solid #10b981' : '1px solid #e2e8f0',
                            bgcolor: isToday ? '#f0fdf4' : 'white',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          {/* Day Header */}
                          <Box
                            sx={{
                              p: 1.5,
                              textAlign: 'center',
                              bgcolor: isToday ? '#10b981' : '#f8fafc',
                              color: isToday ? 'white' : 'text.primary',
                              borderBottom: '1px solid',
                              borderColor: isToday ? '#10b981' : '#e2e8f0',
                            }}
                          >
                            <Typography variant="caption" fontWeight={600} sx={{ opacity: 0.8, display: 'block' }}>
                              {dayNames[idx]}
                            </Typography>
                            <Typography variant="h6" fontWeight={800}>
                              {day.getDate()}
                            </Typography>
                          </Box>

                          {/* Notes List */}
                          <Box sx={{ p: 1, maxHeight: 220, overflowY: 'auto' }}>
                            {notes.length === 0 ? (
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ display: 'block', textAlign: 'center', py: 2, fontStyle: 'italic' }}
                              >
                                Sin notas
                              </Typography>
                            ) : (
                              <Stack spacing={1}>
                                {notes.map((note, noteIdx) => (
                                  <Box
                                    key={note.id}
                                    onClick={() => setSelectedNote(note)}
                                    sx={{
                                      p: 1.5,
                                      borderRadius: '10px',
                                      bgcolor: note.type === 'Evolución' ? '#ecfdf5' : 
                                               note.type === 'Interconsulta' ? '#fef3c7' : '#dbeafe',
                                      borderLeft: '3px solid',
                                      borderColor: note.type === 'Evolución' ? '#10b981' : 
                                                   note.type === 'Interconsulta' ? '#f59e0b' : '#3b82f6',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        transform: 'scale(1.02)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                      },
                                      animation: `fadeSlideIn 0.3s ease ${noteIdx * 0.1}s both`,
                                      '@keyframes fadeSlideIn': {
                                        from: { opacity: 0, transform: 'translateY(10px)' },
                                        to: { opacity: 1, transform: 'translateY(0)' },
                                      },
                                    }}
                                  >
                                    <Typography 
                                      variant="caption" 
                                      fontWeight={700} 
                                      sx={{ 
                                        display: 'block', 
                                        color: note.type === 'Evolución' ? '#059669' : 
                                               note.type === 'Interconsulta' ? '#d97706' : '#2563eb',
                                        lineHeight: 1.2,
                                        mb: 0.5,
                                      }}
                                    >
                                      {note.doctor}
                                    </Typography>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        display: 'block', 
                                        color: 'text.secondary', 
                                        fontSize: '0.65rem',
                                        lineHeight: 1.3,
                                      }}
                                    >
                                      {note.summary}
                                    </Typography>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        display: 'block', 
                                        color: 'text.disabled', 
                                        fontSize: '0.6rem',
                                        mt: 0.5,
                                      }}
                                    >
                                      {note.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {note.type}
                                    </Typography>
                                  </Box>
                                ))}
                              </Stack>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Modal Footer */}
              <Box
                sx={{
                  p: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#f0fdf4',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Stack direction="row" spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#ecfdf5', border: '2px solid #10b981' }} />
                    <Typography variant="caption" color="text.secondary">Evolución</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#fef3c7', border: '2px solid #f59e0b' }} />
                    <Typography variant="caption" color="text.secondary">Interconsulta</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#dbeafe', border: '2px solid #3b82f6' }} />
                    <Typography variant="caption" color="text.secondary">Orden médica</Typography>
                  </Box>
                </Stack>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowNotesHistory(false)}
                  sx={{ borderRadius: '10px', textTransform: 'none', borderColor: '#10b981', color: '#10b981' }}
                >
                  Cerrar
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* Note Detail Modal */}
        <Modal
          open={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 300,
              sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }
            },
          }}
        >
          <Fade in={!!selectedNote}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '80%', md: '60%' },
                maxWidth: 600,
                maxHeight: '85vh',
                bgcolor: 'background.paper',
                borderRadius: '20px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {selectedNote && (
                <>
                  {/* Note Header */}
                  <Box
                    sx={{
                      p: 3,
                      background: selectedNote.type === 'Evolución' 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : selectedNote.type === 'Interconsulta'
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Chip 
                          label={selectedNote.type} 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            color: 'white', 
                            fontWeight: 600,
                            mb: 1.5,
                          }} 
                        />
                        <Typography variant="h5" fontWeight={800}>
                          {selectedNote.doctor}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                          {selectedNote.specialty}
                        </Typography>
                      </Box>
                      <IconButton 
                        onClick={() => setSelectedNote(null)}
                        sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Date/Time Info */}
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      bgcolor: '#f8fafc',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <CalendarMonthIcon sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedNote.date.toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedNote.date.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Note Content */}
                  <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Contenido de la nota
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        lineHeight: 1.8, 
                        color: 'text.primary',
                        textAlign: 'justify',
                      }}
                    >
                      {selectedNote.fullText}
                    </Typography>
                  </Box>

                  {/* Footer */}
                  <Box
                    sx={{
                      p: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button 
                      variant="contained"
                      onClick={() => setSelectedNote(null)}
                      sx={{ 
                        borderRadius: '10px', 
                        textTransform: 'none',
                        bgcolor: selectedNote.type === 'Evolución' ? '#10b981'
                          : selectedNote.type === 'Interconsulta' ? '#f59e0b' : '#3b82f6',
                        '&:hover': {
                          bgcolor: selectedNote.type === 'Evolución' ? '#059669'
                            : selectedNote.type === 'Interconsulta' ? '#d97706' : '#2563eb',
                        }
                      }}
                    >
                      Cerrar
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Fade>
        </Modal>

        {/* Add Medicine Modal */}
        <Modal
          open={showAddMedicine}
          onClose={() => setShowAddMedicine(false)}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 300,
              sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }
            },
          }}
        >
          <Fade in={showAddMedicine}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '450px' },
                bgcolor: 'background.paper',
                borderRadius: '20px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
                overflow: 'hidden',
              }}
            >
              {/* Modal Header */}
              <Box
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocalPharmacyIcon sx={{ fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={700}>
                    Agregar Medicamento
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => setShowAddMedicine(false)}
                  sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Form Content */}
              <Box sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Nombre del medicamento"
                    placeholder="Ej: Acetaminofén"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                  />
                  
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      label="Dosis"
                      placeholder="Ej: 500mg"
                      value={newMedicine.dose}
                      onChange={(e) => setNewMedicine({ ...newMedicine, dose: e.target.value })}
                      InputProps={{ sx: { borderRadius: '12px' } }}
                    />
                    <TextField
                      select
                      fullWidth
                      label="Vía"
                      value={newMedicine.route}
                      onChange={(e) => setNewMedicine({ ...newMedicine, route: e.target.value })}
                      InputProps={{ sx: { borderRadius: '12px' } }}
                    >
                      <MenuItem value="VO">VO (Vía Oral)</MenuItem>
                      <MenuItem value="IV">IV (Intravenosa)</MenuItem>
                      <MenuItem value="IM">IM (Intramuscular)</MenuItem>
                      <MenuItem value="SC">SC (Subcutánea)</MenuItem>
                      <MenuItem value="TOP">TOP (Tópica)</MenuItem>
                    </TextField>
                  </Stack>

                  <TextField
                    fullWidth
                    label="Frecuencia"
                    placeholder="Ej: Cada 8 horas"
                    value={newMedicine.freq}
                    onChange={(e) => setNewMedicine({ ...newMedicine, freq: e.target.value })}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                  />
                </Stack>
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  p: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                }}
              >
                <Button 
                  variant="outlined"
                  onClick={() => {
                    setShowAddMedicine(false);
                    setNewMedicine({ name: '', dose: '', route: 'VO', freq: '' });
                  }}
                  sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="contained"
                  onClick={handleAddMedicine}
                  disabled={!newMedicine.name || !newMedicine.dose || !newMedicine.freq}
                  sx={{ 
                    borderRadius: '10px', 
                    textTransform: 'none',
                    bgcolor: '#10b981',
                    '&:hover': { bgcolor: '#059669' },
                    '&.Mui-disabled': { bgcolor: '#d1d5db' }
                  }}
                  startIcon={<AddIcon />}
                >
                  Agregar
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* Discharge Confirmation Modal */}
        <Modal
          open={showDischargeConfirm}
          onClose={() => setShowDischargeConfirm(false)}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
              sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }
            },
          }}
        >
          <Fade in={showDischargeConfirm}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 450 },
                bgcolor: 'background.paper',
                borderRadius: '24px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'grid',
                    placeItems: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <ExitToAppIcon sx={{ fontSize: 36 }} />
                </Box>
                <Typography variant="h5" fontWeight={800}>
                  Dar de Alta
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                  ¿Confirmar alta del paciente?
                </Typography>
              </Box>

              {/* Content */}
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Estás a punto de dar de alta a:
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                  {patient.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Habitación {patient.room} • {getDaysAdmitted(patient.admissionDate)} días de estancia
                </Typography>
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  p: 3,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <Button 
                  variant="outlined"
                  onClick={() => setShowDischargeConfirm(false)}
                  sx={{ borderRadius: '12px', textTransform: 'none', px: 4 }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="contained"
                  onClick={handleDischargePatient}
                  sx={{ 
                    borderRadius: '12px', 
                    textTransform: 'none',
                    px: 4,
                    bgcolor: '#ef4444',
                    '&:hover': { bgcolor: '#dc2626' },
                  }}
                  startIcon={<ExitToAppIcon />}
                >
                  Confirmar Alta
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </Container>
    </Box>
  );
}

export default ClinicalDashboard;