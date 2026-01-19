import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, styled, Paper, Container, Box, Grid, Button, TextField, 
  Chip, Stack, Divider, List, ListItem, ListItemText, Avatar, MenuItem, 
  IconButton, Modal, Fade, Backdrop 
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
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

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
      console.error("Error fetching patient:", error);
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
        console.error('Error parsing user_info:', error);
      }
    }
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
        console.error("Error fetching patients list:", error);
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
    } catch (error) {
        console.error(error);
        alert("Error al registrar administración.");
    }
  };

  const handleSaveNote = async () => {
    if (!note && !vitals.bp.sbp) return;
    
    // Construct content string
    const vitalsParts = [];
    if (vitals.bp.sbp || vitals.bp.dbp) vitalsParts.push(`PA:${vitals.bp.sbp}/${vitals.bp.dbp}`);
    if (vitals.hr) vitalsParts.push(`FC:${vitals.hr}`);
    if (vitals.fr) vitalsParts.push(`FR:${vitals.fr}`);
    if (vitals.temp) vitalsParts.push(`Temp:${vitals.temp}`);
    const fullContent = `${vitalsParts.join(' ')}\n${note}`;

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
    } catch (error) {
        console.error(error);
        alert("Error al guardar nota.");
    }
  };

  const handleAddMedicine = async () => {
    try {
        const response = await axiosInstance.post(`patients/${patient.id}/add_medication/`, {
            name: newMedicine.name,
            dose: newMedicine.dose,
            route: newMedicine.route,
            freq: newMedicine.freq,
            status: 'due'
        });
        
        setPatient(prev => ({
            ...prev,
            medications: [...prev.medications, response.data]
        }));
        
        addToSessionHistory('NOTE', `Nuevo medicamento: ${newMedicine.name}`);
        setNewMedicine({ name: '', dose: '', route: 'VO', freq: '' });
        setShowAddMedicine(false);
    } catch (error) {
        alert("Error agregando medicamento");
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
      } catch (error) {
          console.error(error);
      }
  };

  const handleDischargePatient = async () => {
    try {
        await axiosInstance.post(`patients/${patient.id}/discharge/`);
        setPatient(prev => ({ ...prev, isDischarged: true, status: 'Alta' }));
        setShowDischargeConfirm(false);
        addToSessionHistory('NOTE', `Paciente dado de alta`);
    } catch (error) {
        alert("Error al dar de alta.");
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
    } catch (error) {
      console.error('Error updating note:', error);
      if (error.response?.status === 403) {
        alert('No tiene permisos para editar esta nota.');
      } else {
        alert('Error al actualizar la nota.');
      }
    }
  };

  const addToSessionHistory = (type, text) => {
    setSessionHistory(prev => [{
      id: Date.now(), type, text,
      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    }, ...prev]);
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
              <Avatar src={genderMeta.avatar} sx={{ width: 74, height: 74, border: '3px solid rgba(255,255,255,0.5)' }} />
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" fontWeight={700}>Paciente</Typography>
                  {patient.isDischarged && <Chip label="DADO DE ALTA" sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 'bold' }} />}
                </Stack>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  EDAD: {patient.age} años • CAMA: {patient.room || 'N/A'} • CC: {patient.cc} • EPS: {patient.eps}
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
                    <TextField label="PAS" size="small" sx={{ width: 70 }} value={vitals.bp.sbp} onChange={(e) => setVitals({...vitals, bp: { ...vitals.bp, sbp: e.target.value }})} InputProps={{ sx: { borderRadius: '12px' } }} />
                    <Typography>/</Typography>
                    <TextField label="PAD" size="small" sx={{ width: 70 }} value={vitals.bp.dbp} onChange={(e) => setVitals({...vitals, bp: { ...vitals.bp, dbp: e.target.value }})} InputProps={{ sx: { borderRadius: '12px' } }} />
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={2}><TextField label="FC" size="small" value={vitals.hr} onChange={(e) => setVitals({...vitals, hr: e.target.value})} InputProps={{ sx: { borderRadius: '12px' } }} /></Grid>
                <Grid item xs={6} sm={2}><TextField label="FR" size="small" value={vitals.fr} onChange={(e) => setVitals({...vitals, fr: e.target.value})} InputProps={{ sx: { borderRadius: '12px' } }} /></Grid>
                <Grid item xs={6} sm={2}><TextField label="Temp" size="small" value={vitals.temp} onChange={(e) => setVitals({...vitals, temp: e.target.value})} InputProps={{ sx: { borderRadius: '12px' } }} /></Grid>
              </Grid>

              <TextField label="Nota de evolución" multiline rows={4} fullWidth placeholder="Escribe la valoración clínica..." value={note} onChange={(e) => setNote(e.target.value)} sx={{ mb: 2 }} InputProps={{ sx: { borderRadius: '12px' } }} />
              
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
                      <Box>
                        {med.status === 'given' && <CheckCircleIcon color="success" />}
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
                    <TextField label="Nombre" fullWidth value={newMedicine.name} onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})} />
                    <TextField label="Dosis" fullWidth value={newMedicine.dose} onChange={(e) => setNewMedicine({...newMedicine, dose: e.target.value})} />
                    <TextField label="Frecuencia" fullWidth value={newMedicine.freq} onChange={(e) => setNewMedicine({...newMedicine, freq: e.target.value})} />
                    <Button variant="contained" onClick={handleAddMedicine}>Guardar</Button>
                </Stack>
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

      </Container>
    </Box>
  );
}

export default ClinicalDashboard;