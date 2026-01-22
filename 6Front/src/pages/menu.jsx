import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Modal,
  Fade,
  Backdrop,
  Paper,
  Stack,
  TextField,
  Typography,
  styled,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MedicationIcon from '@mui/icons-material/Medication';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';

// Patient avatar images
import maleAvatar1 from '../assets/m1.png';
import maleAvatar2 from '../assets/m2.png';
import maleAvatar3 from '../assets/m3.png';
import femaleAvatar1 from '../assets/f1.png';
import femaleAvatar2 from '../assets/f2.png';

// API Service
import axiosInstance from '../api/axios';

const MALE_AVATARS = [maleAvatar1, maleAvatar2, maleAvatar3];
const FEMALE_AVATARS = [femaleAvatar1, femaleAvatar2];

const Background = styled(Box)(() => ({
  position: 'fixed',
  inset: 0,
  background: 'radial-gradient(circle at 10% 10%, rgba(30,136,229,0.10), transparent 40%), radial-gradient(circle at 90% 0%, rgba(16,185,129,0.10), transparent 45%), linear-gradient(180deg, #f7faff 0%, #eef3fb 100%)',
  pointerEvents: 'none',
  zIndex: -1,
}));

const HeroCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '28px',
  background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 55%, #64b5f6 100%)',
  color: '#fff',
  boxShadow: '0 24px 60px rgba(30,136,229,0.35)',
}));

const UnitCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '24px',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
  backgroundColor: '#ffffff',
}));

const PatientRow = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.25),
  borderRadius: '18px',
  border: '1px solid rgba(15, 23, 42, 0.06)',
  background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    borderColor: 'rgba(30,136,229,0.4)',
    boxShadow: '0 14px 32px rgba(30,136,229,0.15)',
  },
}));

const StatPill = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: '8px 14px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.8)',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
  backdropFilter: 'blur(6px)',
}));

function Menu() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [newPatient, setNewPatient] = useState({
    nombre: '',
    fechaNacimiento: '',
    edad: '',
    genero: 'Masculino',
    cc: '',
    eps: '',
    alergias: '',
    diagnosticos: '',
    nombreAcudiente: '',
    telefono: '',
    enfermedadesPrevias: '',
    cirugias: '',
    direccion: '',
  });

  // Fetch patients from API
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('patients/');
      
      // Map Django serializer response to UI format
      const formattedPatients = response.data.patients.map(p => ({
        id: p.id,
        name: p.nombre,
        fechaNacimiento: p.fecha_nacimiento,
        age: p.edad,
        genero: p.genero,
        cc: p.cc,
        room: p.room,
        eps: p.eps,
        status: p.status,
        medsDue: p.meds_due,
        admissionDate: p.fecha_ingreso
      }));

      setPatients(formattedPatients);
    } catch (err) {
      // Error handling - log only in development
      if (import.meta.env.DEV) {
        console.error('API error:', err);
      }
      setError('Error conectando con el servidor. Verifique su conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    
    // Get current user info
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        setCurrentUser(JSON.parse(userInfo));
      } catch (error) {
        console.error('Error parsing user_info:', error);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleNewPatientChange = (field) => (e) => {
    const value = e.target.value;
    setNewPatient(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate age when fechaNacimiento changes
      if (field === 'fechaNacimiento' && value) {
        updated.edad = calculateAge(value);
      }
      return updated;
    });
  };

  const handleAddPatient = async () => {
    // Validation
    if (!newPatient.nombre || !newPatient.nombre.trim()) {
      setSnackbar({ open: true, message: 'El nombre completo es requerido.', severity: 'error' });
      return;
    }
    if (!newPatient.cc || newPatient.cc.length < 7 || newPatient.cc.length > 20) {
      setSnackbar({ open: true, message: 'La cédula de ciudadanía es requerida (7-20 dígitos).', severity: 'error' });
      return;
    }
    if (!newPatient.fechaNacimiento && (!newPatient.edad || parseInt(newPatient.edad) < 0 || parseInt(newPatient.edad) > 150)) {
      setSnackbar({ open: true, message: 'Debe proporcionar fecha de nacimiento o edad válida (0-150 años).', severity: 'error' });
      return;
    }
    if (newPatient.edad && (parseInt(newPatient.edad) < 0 || parseInt(newPatient.edad) > 150)) {
      setSnackbar({ open: true, message: 'La edad debe estar entre 0 y 150 años.', severity: 'error' });
      return;
    }
    if (!newPatient.eps || !newPatient.eps.trim()) {
      setSnackbar({ open: true, message: 'La EPS es requerida.', severity: 'error' });
      return;
    }
    if (!newPatient.nombreAcudiente || !newPatient.nombreAcudiente.trim()) {
      setSnackbar({ open: true, message: 'El nombre del acudiente es requerido.', severity: 'error' });
      return;
    }
    if (!newPatient.telefono || newPatient.telefono.length < 7 || newPatient.telefono.length > 15) {
      setSnackbar({ open: true, message: 'El teléfono debe tener entre 7 y 15 dígitos.', severity: 'error' });
      return;
    }
    
    setSubmitting(true);
    
    // Prepare payload matching Django Model fields
    const payload = {
        nombre: newPatient.nombre.trim(),
        cc: newPatient.cc,
        fecha_nacimiento: newPatient.fechaNacimiento || null,
        edad: newPatient.edad ? parseInt(newPatient.edad) : null,
        genero: newPatient.genero,
        direccion: newPatient.direccion?.trim() || '',
        eps: newPatient.eps.trim(),
        alergias: newPatient.alergias?.trim() || '',
        diagnosticos: newPatient.diagnosticos?.trim() || '',
        status: 'Estable',
        enfermedades_previas: newPatient.enfermedadesPrevias?.trim() || '',
        cirugias: newPatient.cirugias?.trim() || '',
        nombre_acudiente: newPatient.nombreAcudiente.trim(),
        telefono_acudiente: newPatient.telefono
    };

    try {
      const response = await axiosInstance.post('patients/', payload);
      
      // Add new patient to local state immediately
      const created = response.data;
      const newPatientData = {
        id: created.id,
        name: created.nombre,
        cc: created.cc,
        genero: created.genero,
        room: created.room,
        age: created.edad,
        status: created.status,
        eps: created.eps,
        medsDue: 0,
      };
      
      setPatients(prev => [newPatientData, ...prev]);
      
      // Reset form and close modal
      setNewPatient({
        nombre: '', fechaNacimiento: '', edad: '', genero: 'Masculino', cc: '',
        eps: '', alergias: '', diagnosticos: '', nombreAcudiente: '', telefono: '', 
        enfermedadesPrevias: '', cirugias: '', direccion: '',
      });
      setShowNewPatientModal(false);
      setSnackbar({ open: true, message: '¡Paciente registrado exitosamente!', severity: 'success' });
    } catch (err) {
      console.error('Error creating patient:', err);
      setSnackbar({ open: true, message: 'Error al registrar paciente.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const activePatients = useMemo(
    () => patients.filter((p) => p.status !== 'Alta'),
    [patients]
  );
  const totalPatients = useMemo(() => activePatients.length, [activePatients]);
  const medsDue = useMemo(
    () => activePatients.reduce((sum, p) => sum + (p.medsDue || 0), 0),
    [activePatients]
  );

  const getGenderMeta = (genero, patientId) => {
    const isFemale = genero?.toLowerCase() === 'femenino';
    const idNum = typeof patientId === 'number' ? patientId : parseInt(String(patientId).replace(/\D+/g, ''), 10) || 0;
    const avatars = isFemale ? FEMALE_AVATARS : MALE_AVATARS;
    const avatarIndex = idNum % avatars.length;
    return {
      isFemale,
      color: isFemale ? '#e91e63' : '#2f84e4',
      avatar: avatars[avatarIndex],
    };
  };

  const filteredPatients = useMemo(() => {
    const baseList = search ? patients : activePatients;
    if (!search) return baseList;
    const query = search.toLowerCase();
    return baseList.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        String(p.id).toLowerCase().includes(query) ||
        (p.cc && p.cc.toLowerCase().includes(query)) ||
        (p.room && p.room.toLowerCase().includes(query)) ||
        (p.eps && p.eps.toLowerCase().includes(query))
    );
  }, [search, patients, activePatients]);

  const getUsername = () => {
    // First try to get from user_info stored during login
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        return user.username || 'usuario';
      } catch (error) {
        console.error('Error parsing user_info:', error);
      }
    }
    
    // Fallback: try to parse JWT token (not recommended, but as backup)
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.username || payload.email || (payload.user_id ? `usuario ${payload.user_id}` : 'usuario');
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    
    return 'usuario';
  };

  const username = getUsername();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const handleOpenPatient = (patient) => {
    navigate(`/patient/${patient.id}`, { state: { patient: patient, patients: activePatients } });
  };

  const handleEditPatient = async (patient) => {
    try {
      // Fetch full patient data
      const response = await axiosInstance.get(`patients/${patient.id}/`);
      const data = response.data;
      
      setEditingPatient({
        id: data.id,
        nombre: data.nombre || '',
        fechaNacimiento: data.fecha_nacimiento || '',
        edad: data.edad ? data.edad.toString() : '',
        genero: data.genero || 'Masculino',
        cc: data.cc || '',
        eps: data.eps || '',
        alergias: data.alergias || '',
        diagnosticos: data.diagnosticos || '',
        nombreAcudiente: data.nombre_acudiente || '',
        telefono: data.telefono_acudiente || '',
        enfermedadesPrevias: data.enfermedades_previas || '',
        cirugias: data.cirugias || '',
        direccion: data.direccion || '',
      });
      setShowEditPatientModal(true);
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setSnackbar({ open: true, message: 'Error al cargar datos del paciente.', severity: 'error' });
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
      setSnackbar({ open: true, message: 'El nombre completo es requerido.', severity: 'error' });
      return;
    }
    if (!editingPatient.cc || editingPatient.cc.length < 7 || editingPatient.cc.length > 20) {
      setSnackbar({ open: true, message: 'La cédula de ciudadanía es requerida (7-20 dígitos).', severity: 'error' });
      return;
    }
    if (!editingPatient.fechaNacimiento && (!editingPatient.edad || parseInt(editingPatient.edad) < 0 || parseInt(editingPatient.edad) > 150)) {
      setSnackbar({ open: true, message: 'Debe proporcionar fecha de nacimiento o edad válida (0-150 años).', severity: 'error' });
      return;
    }
    if (editingPatient.edad && (parseInt(editingPatient.edad) < 0 || parseInt(editingPatient.edad) > 150)) {
      setSnackbar({ open: true, message: 'La edad debe estar entre 0 y 150 años.', severity: 'error' });
      return;
    }
    if (!editingPatient.eps || !editingPatient.eps.trim()) {
      setSnackbar({ open: true, message: 'La EPS es requerida.', severity: 'error' });
      return;
    }
    
    setSubmitting(true);
    
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
      const response = await axiosInstance.patch(`patients/${editingPatient.id}/`, payload);
      
      // Update patient in local state
      setPatients(prev => prev.map(p => 
        p.id === editingPatient.id 
          ? {
              ...p,
              name: response.data.nombre,
              fechaNacimiento: response.data.fecha_nacimiento,
              age: response.data.edad,
              cc: response.data.cc,
              eps: response.data.eps,
              genero: response.data.genero,
            }
          : p
      ));
      
      setShowEditPatientModal(false);
      setEditingPatient(null);
      setSnackbar({ open: true, message: '¡Paciente actualizado exitosamente!', severity: 'success' });
    } catch (err) {
      console.error('Error updating patient:', err);
      if (err.response?.status === 403) {
        setSnackbar({ open: true, message: 'No tiene permisos para editar pacientes.', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: err.response?.data?.detail || 'Error al actualizar paciente.', severity: 'error' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 6, position: 'relative' }}>
      <Background />
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, maxWidth: '1400px' }}>
        <Stack spacing={3}>
          <HeroCard>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h3" fontWeight={800}>
                  SEXTA MEDICAL
                </Typography>
                <Typography variant="h3" sx={{ opacity: 0.98 }}>
                  Hogar San Sebastian
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="h6" fontWeight={600} sx={{ opacity: 0.9 }}>
                  Bienvenido {username},
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                  Sexta Medical lista para un día de trabajo
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.7)',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '999px',
                    px: 3,
                    '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.12)' },
                  }}
                >
                  Cerrar sesión
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                size="medium"
                placeholder="Buscar por paciente, diagnóstico o habitación"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '999px',
                    bgcolor: '#fff',
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.18)',
                  },
                }}
                sx={{ maxWidth: 720 }}
              />
            </Box>
          </HeroCard>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Bogotá • {now.toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long' })} • {now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <StatPill>
                <GroupsIcon fontSize="small" />
                <Typography variant="body2" fontWeight={600}>Pacientes activos: {totalPatients}</Typography>
              </StatPill>
              <StatPill>
                <MedicationIcon fontSize="small" />
                <Typography variant="body2" fontWeight={600}>Pendientes: {medsDue}</Typography>
              </StatPill>
            </Box>
          </Box>

          {error && (
            <Alert 
              severity="info" 
              sx={{ borderRadius: '12px' }}
              action={<IconButton size="small" onClick={fetchPatients}><RefreshIcon /></IconButton>}
            >
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={48} />
              </Box>
            ) : (
              <UnitCard>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>Habitaciones</Typography>
                    <Typography variant="body2" color="text.secondary">Pacientes en Hogar</Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip 
                      icon={<PersonAddIcon />} 
                      label="Nuevo paciente" 
                      color="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNewPatientModal(true);
                      }}
                      sx={{ 
                        cursor: 'pointer', fontWeight: 600,
                        '&:hover': { transform: 'scale(1.05)', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)' },
                        transition: 'all 0.2s ease',
                      }}
                    />
                    <IconButton 
                      size="small" 
                      onClick={fetchPatients}
                      sx={{ 
                        bgcolor: 'primary.light', color: 'primary.dark',
                        '&:hover': { bgcolor: 'primary.main', color: 'white' },
                      }}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  {filteredPatients.map((patient) => (
                    <Grid item xs={12} md={6} key={patient.id}>
                      <PatientRow role="button" aria-label={`Abrir ficha de ${patient.name}`}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          {(() => {
                            const genderMeta = getGenderMeta(patient.genero, patient.id);
                            return <Avatar src={genderMeta.avatar} sx={{ width: 48, height: 48 }} />;
                          })()}
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box sx={{ flex: 1 }} onClick={() => handleOpenPatient(patient)} style={{ cursor: 'pointer' }}>
                                <Typography variant="subtitle1" fontWeight={700} color={getGenderMeta(patient.genero, patient.id).color}>
                                  {patient.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  CC: {patient.cc || 'N/A'} • Cama {patient.room || 'N/A'} 
                                </Typography>
                              </Box>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                {currentUser?.is_superuser && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditPatient(patient);
                                    }}
                                    sx={{
                                      color: 'primary.main',
                                      '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                    }}
                                    title="Editar paciente"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                )}
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenPatient(patient)}
                                  sx={{
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                  }}
                                >
                                  <ArrowForwardIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                              <Chip size="small" color="primary" label={patient.status || 'Estable'} />
                              {patient.medsDue > 0 && (
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: '#ff9800',
                                    boxShadow: '0 0 4px rgba(255, 152, 0, 0.6)',
                                  }}
                                  title={`${patient.medsDue} dosis pendientes`}
                                />
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      </PatientRow>
                    </Grid>
                  ))}
                </Grid>

                {filteredPatients.length === 0 && !loading && (
                  <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '16px', border: '1px dashed', borderColor: 'divider', mt: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {search ? 'Sin coincidencias' : 'No hay pacientes registrados'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {search ? 'Prueba otro nombre o habitación.' : 'Haz clic en "Nuevo paciente" para comenzar.'}
                    </Typography>
                  </Paper>
                )}
              </UnitCard>
            )}
          </Stack>
        </Stack>
      </Container>

      {/* New Patient Modal */}
      <Modal
        open={showNewPatientModal}
        onClose={() => setShowNewPatientModal(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: { timeout: 500, sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' } },
        }}
      >
        <Fade in={showNewPatientModal}>
          <Box
            sx={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: { xs: '95%', sm: '90%', md: 900 }, maxHeight: '95vh',
              bgcolor: 'background.paper', borderRadius: '24px',
              boxShadow: '0 32px 100px rgba(0,0,0,0.3)', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', p: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
                  <PersonAddIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800}>Nuevo Paciente</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>Complete los campos requeridos</Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setShowNewPatientModal(false)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, p: 1 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Form Content */}
            <Box sx={{ flex: 1, overflow: 'hidden', p: 2.5 }}>
              <Grid container spacing={2}>
                
                {/* SECTION 1: Información Personal */}
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0f7ff', borderRadius: '12px', border: '1px solid', borderColor: 'primary.light' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PersonIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={700} color="primary">Información Personal</Typography>
                    </Box>
                    
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Nombre completo" 
                          fullWidth 
                          required 
                          size="small"
                          value={newPatient.nombre} 
                          onChange={handleNewPatientChange('nombre')} 
                          InputProps={{ sx: { borderRadius: '12px' } }}
                          placeholder="Ej: Juan Pérez García"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Cédula de Ciudadanía (ID)" 
                          fullWidth 
                          required 
                          type="tel"
                          size="small"
                          value={newPatient.cc} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 20) {
                              handleNewPatientChange('cc')({ target: { value } });
                            }
                          }}
                          InputProps={{ 
                            sx: { borderRadius: '12px' },
                            inputProps: { maxLength: 20 }
                          }}
                          error={newPatient.cc && (newPatient.cc.length < 7 || newPatient.cc.length > 20)}
                          helperText={newPatient.cc && (newPatient.cc.length < 7 || newPatient.cc.length > 20) 
                            ? '7-20 dígitos' 
                            : 'ID único (solo números)'}
                          placeholder="1234567890"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <TextField 
                          label="Fecha de Nacimiento" 
                          fullWidth 
                          type="date"
                          size="small"
                          value={newPatient.fechaNacimiento} 
                          onChange={handleNewPatientChange('fechaNacimiento')}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{ sx: { borderRadius: '12px' } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={2}>
                        <TextField 
                          label="Edad" 
                          fullWidth 
                          type="number" 
                          size="small"
                          value={newPatient.edad} 
                          onChange={handleNewPatientChange('edad')} 
                          InputProps={{ 
                            sx: { borderRadius: '12px' }, 
                            inputProps: { min: 0, max: 150, step: 1 } 
                          }}
                          error={newPatient.edad && (parseInt(newPatient.edad) < 0 || parseInt(newPatient.edad) > 150)}
                          helperText={newPatient.edad && (parseInt(newPatient.edad) < 0 || parseInt(newPatient.edad) > 150) 
                            ? '0-150' 
                            : 'Opcional'}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <TextField 
                          select 
                          label="Género" 
                          fullWidth 
                          required 
                          size="small"
                          value={newPatient.genero} 
                          onChange={handleNewPatientChange('genero')} 
                          InputProps={{ sx: { borderRadius: '12px' } }}
                        >
                          <MenuItem value="Masculino">Masculino</MenuItem>
                          <MenuItem value="Femenino">Femenino</MenuItem>
                        </TextField>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <TextField 
                          label="EPS" 
                          fullWidth 
                          required 
                          size="small"
                          value={newPatient.eps} 
                          onChange={handleNewPatientChange('eps')} 
                          InputProps={{ sx: { borderRadius: '12px' } }}
                          placeholder="Ej: Sura, Coomeva"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={8}>
                        <TextField 
                          label="Dirección" 
                          fullWidth 
                          size="small"
                          value={newPatient.direccion} 
                          onChange={handleNewPatientChange('direccion')} 
                          InputProps={{ 
                            sx: { borderRadius: '12px' }, 
                            startAdornment: (<InputAdornment position="start"><HomeIcon color="action" /></InputAdornment>) 
                          }}
                          placeholder="Ej: Calle 123 #45-67"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* SECTION 2: Información Médica */}
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#fffbf0', borderRadius: '12px', border: '1px solid', borderColor: 'warning.light' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'warning.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LocalPharmacyIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'warning.dark' }}>Información Médica</Typography>
                    </Box>
                    
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Alergias" 
                          fullWidth 
                          multiline 
                          rows={2} 
                          value={newPatient.alergias} 
                          onChange={handleNewPatientChange('alergias')} 
                          InputProps={{ sx: { borderRadius: '12px' } }}
                          placeholder="Ej: Penicilina, Ibuprofeno, etc."
                          size="small"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Diagnósticos" 
                          fullWidth 
                          multiline 
                          rows={2} 
                          value={newPatient.diagnosticos} 
                          onChange={handleNewPatientChange('diagnosticos')} 
                          InputProps={{ sx: { borderRadius: '12px' } }}
                          placeholder="Ej: Hipertensión, Diabetes tipo 2, etc."
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* SECTION 3: Contacto de Emergencia */}
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff0f0', borderRadius: '12px', border: '1px solid', borderColor: 'error.light' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FamilyRestroomIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'error.dark' }}>Contacto de Emergencia</Typography>
                    </Box>
                    
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Nombre del acudiente" 
                          fullWidth 
                          required 
                          size="small"
                          value={newPatient.nombreAcudiente} 
                          onChange={handleNewPatientChange('nombreAcudiente')} 
                          InputProps={{ sx: { borderRadius: '12px' } }}
                          placeholder="Ej: María Pérez"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Teléfono del acudiente" 
                          fullWidth 
                          required 
                          type="tel"
                          size="small"
                          value={newPatient.telefono} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 15) {
                              handleNewPatientChange('telefono')({ target: { value } });
                            }
                          }}
                          InputProps={{ 
                            sx: { borderRadius: '12px' },
                            inputProps: { maxLength: 15 }
                          }}
                          error={newPatient.telefono && (newPatient.telefono.length < 7 || newPatient.telefono.length > 15)}
                          helperText={newPatient.telefono && (newPatient.telefono.length < 7 || newPatient.telefono.length > 15) 
                            ? '7-15 dígitos' 
                            : 'Solo números'}
                          placeholder="3001234567"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ 
              p: 2, 
              borderTop: '1px solid', 
              borderColor: 'divider', 
              bgcolor: '#f8f9fa', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              gap: 2 
            }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Campos marcados con * son obligatorios
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowNewPatientModal(false)} 
                  size="small"
                  sx={{ 
                    borderRadius: '10px', 
                    px: 3, 
                    py: 1, 
                    textTransform: 'none', 
                    fontWeight: 600,
                    borderColor: 'grey.300',
                    color: 'grey.700',
                    '&:hover': {
                      borderColor: 'grey.400',
                      bgcolor: 'grey.50'
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleAddPatient} 
                  size="small"
                  disabled={submitting || !newPatient.nombre || !newPatient.cc || (!newPatient.fechaNacimiento && !newPatient.edad) || !newPatient.eps} 
                  sx={{ 
                    borderRadius: '10px', 
                    px: 3, 
                    py: 1, 
                    textTransform: 'none', 
                    fontWeight: 600, 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', 
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)'
                    }, 
                    '&:disabled': { 
                      background: '#e0e0e0', 
                      boxShadow: 'none',
                      color: '#9e9e9e'
                    } 
                  }}
                >
                  {submitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} color="inherit" />
                      Registrando...
                    </Box>
                  ) : (
                    'Registrar Paciente'
                  )}
                </Button>
              </Box>
            </Box>
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
              width: { xs: '95%', sm: '90%', md: 900 }, maxHeight: '95vh',
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
              <Box sx={{ flex: 1, overflow: 'hidden', p: 2.5 }}>
                <Grid container spacing={2}>
                  
                  {/* SECTION 1: Información Personal */}
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: '12px', border: '1px solid', borderColor: 'primary.light' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <PersonIcon sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'primary.dark' }}>Información Personal</Typography>
                      </Box>
                      
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} md={6}>
                          <TextField 
                            label="Nombre completo" 
                            fullWidth 
                            required 
                            size="small"
                            value={editingPatient.nombre} 
                            onChange={handleEditPatientChange('nombre')} 
                            InputProps={{ sx: { borderRadius: '12px' } }}
                            placeholder="Ej: Juan Pérez García"
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
                            InputProps={{ 
                              sx: { borderRadius: '12px' },
                              inputProps: { maxLength: 20 }
                            }}
                            error={editingPatient.cc && (editingPatient.cc.length < 7 || editingPatient.cc.length > 20)}
                            helperText={editingPatient.cc && (editingPatient.cc.length < 7 || editingPatient.cc.length > 20) 
                              ? '7-20 dígitos' 
                              : 'ID único (solo números)'}
                            placeholder="1234567890"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={3}>
                          <TextField 
                            label="Fecha de Nacimiento" 
                            fullWidth 
                            type="date"
                            size="small"
                            value={editingPatient.fechaNacimiento} 
                            onChange={handleEditPatientChange('fechaNacimiento')}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{ sx: { borderRadius: '12px' } }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={3}>
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
                            InputProps={{ 
                              sx: { borderRadius: '12px' },
                              inputProps: { min: 0, max: 150 }
                            }}
                            helperText="Se calcula automáticamente si hay fecha de nacimiento"
                            placeholder="Años"
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
                            InputProps={{ sx: { borderRadius: '12px' } }}
                            SelectProps={{ native: true }}
                          >
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                          </TextField>
                        </Grid>
                        
                        <Grid item xs={12} md={8}>
                          <TextField 
                            label="Dirección" 
                            fullWidth 
                            size="small"
                            value={editingPatient.direccion} 
                            onChange={handleEditPatientChange('direccion')} 
                            InputProps={{ 
                              sx: { borderRadius: '12px' }, 
                              startAdornment: (<InputAdornment position="start"><HomeIcon color="action" /></InputAdornment>) 
                            }}
                            placeholder="Ej: Calle 123 #45-67"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* SECTION 2: Información Médica */}
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#fffbf0', borderRadius: '12px', border: '1px solid', borderColor: 'warning.light' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'warning.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LocalPharmacyIcon sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'warning.dark' }}>Información Médica</Typography>
                      </Box>
                      
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} md={6}>
                          <TextField 
                            label="EPS" 
                            fullWidth 
                            required 
                            size="small"
                            value={editingPatient.eps} 
                            onChange={handleEditPatientChange('eps')} 
                            InputProps={{ sx: { borderRadius: '12px' } }}
                            placeholder="Ej: SURA, COOMEVA"
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
                            InputProps={{ sx: { borderRadius: '12px' } }}
                            placeholder="Ej: Penicilina, Látex"
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField 
                            label="Diagnósticos" 
                            fullWidth 
                            multiline 
                            rows={2}
                            size="small"
                            value={editingPatient.diagnosticos} 
                            onChange={handleEditPatientChange('diagnosticos')} 
                            InputProps={{ sx: { borderRadius: '12px' } }}
                            placeholder="Ej: Hipertensión arterial, Diabetes tipo 2"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField 
                            label="Enfermedades Previas" 
                            fullWidth 
                            size="small"
                            value={editingPatient.enfermedadesPrevias} 
                            onChange={handleEditPatientChange('enfermedadesPrevias')} 
                            InputProps={{ sx: { borderRadius: '12px' } }}
                            placeholder="Ej: Asma, Hipertensión"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField 
                            label="Cirugías" 
                            fullWidth 
                            size="small"
                            value={editingPatient.cirugias} 
                            onChange={handleEditPatientChange('cirugias')} 
                            InputProps={{ sx: { borderRadius: '12px' } }}
                            placeholder="Ej: Apendicectomía (2010)"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* SECTION 3: Información del Acudiente */}
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#fef3f2', borderRadius: '12px', border: '1px solid', borderColor: 'error.light' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FamilyRestroomIcon sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'error.dark' }}>Información del Acudiente</Typography>
                      </Box>
                      
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} md={6}>
                          <TextField 
                            label="Nombre del Acudiente" 
                            fullWidth 
                            size="small"
                            value={editingPatient.nombreAcudiente} 
                            onChange={handleEditPatientChange('nombreAcudiente')} 
                            InputProps={{ sx: { borderRadius: '12px' } }}
                            placeholder="Ej: María García"
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
                            InputProps={{ 
                              sx: { borderRadius: '12px' },
                              inputProps: { min: 0, maxLength: 15 }
                            }}
                            error={editingPatient.telefono && (editingPatient.telefono.length < 7 || editingPatient.telefono.length > 15)}
                            helperText={editingPatient.telefono && (editingPatient.telefono.length < 7 || editingPatient.telefono.length > 15) 
                              ? '7-15 dígitos' 
                              : 'Solo números'}
                            placeholder="3001234567"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
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
                  disabled={submitting || !editingPatient?.nombre || !editingPatient?.cc || (!editingPatient?.fechaNacimiento && !editingPatient?.edad) || !editingPatient?.eps} 
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
                  {submitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} color="inherit" />
                      Actualizando...
                    </Box>
                  ) : (
                    'Actualizar Paciente'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Menu;