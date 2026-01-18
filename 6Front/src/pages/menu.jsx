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
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(new Date());
  const [newPatient, setNewPatient] = useState({
    nombre: '',
    edad: '',
    genero: 'Masculino',
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
      console.error('API error:', err);
      setError('Error conectando con el servidor. Verifique su conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNewPatientChange = (field) => (e) => {
    setNewPatient(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddPatient = async () => {
    setSubmitting(true);
    
    // Prepare payload matching Django Model fields
    const payload = {
        nombre: newPatient.nombre,
        edad: parseInt(newPatient.edad),
        genero: newPatient.genero,
        cc: '', // Add field if you want to capture ID in modal
        direccion: newPatient.direccion,
        eps: newPatient.eps,
        alergias: newPatient.alergias,
        diagnosticos: newPatient.diagnosticos,
        status: 'Estable',
        enfermedades_previas: newPatient.enfermedadesPrevias,
        cirugias: newPatient.cirugias,
        nombre_acudiente: newPatient.nombreAcudiente,
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
        nombre: '', edad: '', genero: 'Masculino', eps: '', alergias: '',
        diagnosticos: '', nombreAcudiente: '', telefono: '', 
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

  const getUsernameFromToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return 'usuario';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || payload.email || payload.user || (payload.user_id ? `usuario ${payload.user_id}` : 'usuario');
    } catch (error) {
      return 'usuario';
    }
  };

  const username = getUsernameFromToken();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const handleOpenPatient = (patient) => {
    navigate(`/patient/${patient.id}`, { state: { patient: patient, patients: activePatients } });
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
                      <PatientRow onClick={() => handleOpenPatient(patient)} role="button" aria-label={`Abrir ficha de ${patient.name}`}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          {(() => {
                            const genderMeta = getGenderMeta(patient.genero, patient.id);
                            return <Avatar src={genderMeta.avatar} sx={{ width: 48, height: 48 }} />;
                          })()}
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="subtitle1" fontWeight={700} color={getGenderMeta(patient.genero, patient.id).color}>
                                  {patient.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Cama {patient.room || 'N/A'} 
                                </Typography>
                              </Box>
                              <ArrowForwardIcon color="primary" />
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                              <Chip size="small" color="primary" label={patient.status || 'Estable'} />
                              {patient.medsDue > 0 && (
                                <Chip
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    icon={<MedicationIcon sx={{ fontSize: 16 }} />}
                                    label={`${patient.medsDue} dosis pendientes`}
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
              width: { xs: '95%', sm: '90%', md: 800 }, maxHeight: '90vh',
              bgcolor: 'background.paper', borderRadius: '24px',
              boxShadow: '0 32px 100px rgba(0,0,0,0.3)', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', p: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 50, height: 50, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
                  <PersonAddIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800}>Nuevo Paciente</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Complete los campos requeridos</Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setShowNewPatientModal(false)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Form Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon sx={{ color: '#2f84e4' }} />
                    <Typography variant="h6" fontWeight={700} color="primary">Información Personal</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField label="Nombre completo" fullWidth required value={newPatient.nombre} onChange={handleNewPatientChange('nombre')} InputProps={{ sx: { borderRadius: '12px' } }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label="Edad" fullWidth required type="number" value={newPatient.edad} onChange={handleNewPatientChange('edad')} InputProps={{ sx: { borderRadius: '12px' }, inputProps: { min: 0, max: 150 } }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField select label="Género" fullWidth required value={newPatient.genero} onChange={handleNewPatientChange('genero')} InputProps={{ sx: { borderRadius: '12px' } }}>
                    <MenuItem value="Masculino">Masculino</MenuItem>
                    <MenuItem value="Femenino">Femenino</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="EPS" fullWidth required value={newPatient.eps} onChange={handleNewPatientChange('eps')} InputProps={{ sx: { borderRadius: '12px' } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Dirección" fullWidth value={newPatient.direccion} onChange={handleNewPatientChange('direccion')} InputProps={{ sx: { borderRadius: '12px' }, startAdornment: (<InputAdornment position="start"><HomeIcon color="action" /></InputAdornment>) }} />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 2 }}>
                    <LocalPharmacyIcon sx={{ color: '#f59e0b' }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#f59e0b' }}>Información Médica</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}><TextField label="Alergias" fullWidth multiline rows={2} value={newPatient.alergias} onChange={handleNewPatientChange('alergias')} InputProps={{ sx: { borderRadius: '12px' } }} /></Grid>
                <Grid item xs={12}><TextField label="Diagnósticos" fullWidth multiline rows={2} value={newPatient.diagnosticos} onChange={handleNewPatientChange('diagnosticos')} InputProps={{ sx: { borderRadius: '12px' } }} /></Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 2 }}>
                    <FamilyRestroomIcon sx={{ color: '#ef4444' }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#ef4444' }}>Contacto de Emergencia</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}><TextField label="Nombre del acudiente" fullWidth required value={newPatient.nombreAcudiente} onChange={handleNewPatientChange('nombreAcudiente')} InputProps={{ sx: { borderRadius: '12px' } }} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Teléfono del acudiente" fullWidth required value={newPatient.telefono} onChange={handleNewPatientChange('telefono')} InputProps={{ sx: { borderRadius: '12px' } }} /></Grid>
              </Grid>
            </Box>

            <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => setShowNewPatientModal(false)} sx={{ borderRadius: '12px', px: 4, py: 1.5, textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
              <Button variant="contained" onClick={handleAddPatient} disabled={submitting || !newPatient.nombre || !newPatient.edad || !newPatient.eps} sx={{ borderRadius: '12px', px: 4, py: 1.5, textTransform: 'none', fontWeight: 600, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)', '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }, '&:disabled': { background: '#e0e0e0', boxShadow: 'none' } }}>
                {submitting ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={20} color="inherit" />Registrando...</Box> : 'Registrar Paciente'}
              </Button>
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