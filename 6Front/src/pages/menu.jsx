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
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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
import { patientApi } from '../services/api';

const MALE_AVATARS = [maleAvatar1, maleAvatar2, maleAvatar3];
const FEMALE_AVATARS = [femaleAvatar1, femaleAvatar2];

const DEFAULT_MEDS = [
  { id: 'm1', name: 'Ceftriaxona', dose: '1g', route: 'IV', freq: 'Diario', status: 'due' },
  { id: 'm2', name: 'Azitromicina', dose: '500mg', route: 'VO', freq: 'Diario', status: 'due' },
  { id: 'm3', name: 'Acetaminofén', dose: '650mg', route: 'VO', freq: 'SOS', status: 'available' },
];

// Fallback data when API is not available
const FALLBACK_PATIENTS = [
  {
    id: 'p1',
    name: 'William H',
    cc: '105500020',
    genero: 'Masculino',
    room: '1',
    age: 64,
    status: 'Crítico',
    eps: 'Sanitas',
    medsDue: 2,
    medications: DEFAULT_MEDS,
  },
  {
    id: 'p2',
    name: 'Maria F',
    cc: '1097383936',
    genero: 'Femenino',
    room: '2',
    age: 64,
    eps: 'Sanitas',
    status: 'Crítico',
    medsDue: 2,
    medications: DEFAULT_MEDS,
  },
  {
    id: 'p3',
    name: 'Juan',
    cc: '1097383936',
    genero: 'Masculino',
    room: '3',
    age: 64,
    eps: 'Sanitas',
    status: 'Crítico',
    medsDue: 2,
    medications: DEFAULT_MEDS,
  },
  {
    id: 'p4',
    name: 'Martin ',
    cc: '00000000',
    genero: 'Masculino',
    room: '4',
    age: 64,
    eps: 'Sanitas',
    status: 'Crítico',
    medsDue: 2,
    medications: DEFAULT_MEDS,
  },
  {
    id: 'p5',
    name: 'Lina P',
    cc: '1097383936',
    genero: 'Femenino',
    room: '5',
    age: 64,
    eps: 'Sanitas',
    status: 'Crítico',
    medsDue: 2,
    medications: DEFAULT_MEDS,
  },
];

const Background = styled(Box)(({ theme }) => ({
  position: 'fixed',
  inset: 0,
  backgroundImage: `linear-gradient(${theme.palette.primary.main} 1px, transparent 1px), linear-gradient(90deg, ${theme.palette.primary.main} 1px, transparent 1px)`,
  backgroundSize: '34px 34px',
  opacity: 0.04,
  pointerEvents: 'none',
  zIndex: -1,
}));

const UnitCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '18px',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
  backgroundColor: theme.palette.background.paper,
}));

const PatientRow = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '14px',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    borderColor: theme.palette.primary.main,
    boxShadow: '0 10px 24px rgba(47,132,228,0.12)',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
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
      const response = await patientApi.getAll();
      setPatients(response.patients || []);
    } catch (err) {
      console.warn('API no disponible, usando datos de respaldo:', err);
      setPatients(FALLBACK_PATIENTS);
      setError('Modo offline: usando datos de demostración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleNewPatientChange = (field) => (e) => {
    setNewPatient(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddPatient = async () => {
    setSubmitting(true);
    try {
      const response = await patientApi.create(newPatient);
      
      // Add new patient to local state
      const newPatientData = {
        id: response.patient.id,
        name: newPatient.nombre,
        cc: '',
        genero: newPatient.genero,
        room: response.patient.room,
        age: parseInt(newPatient.edad),
        status: 'Estable',
        eps: newPatient.eps,
        medsDue: 0,
        medications: [],
      };
      
      setPatients(prev => [...prev, newPatientData]);
      
      // Reset form and close modal
      setNewPatient({
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
      setShowNewPatientModal(false);
      setSnackbar({ open: true, message: '¡Paciente registrado exitosamente!', severity: 'success' });
    } catch (err) {
      console.error('Error creating patient:', err);
      // Fallback: add to local state anyway for demo purposes
      const tempId = `p${Date.now()}`;
      const newPatientData = {
        id: tempId,
        name: newPatient.nombre,
        cc: '',
        genero: newPatient.genero,
        room: String(patients.length + 1),
        age: parseInt(newPatient.edad),
        status: 'Estable',
        eps: newPatient.eps,
        medsDue: 0,
        medications: DEFAULT_MEDS,
      };
      
      setPatients(prev => [...prev, newPatientData]);
      setNewPatient({
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
      setShowNewPatientModal(false);
      setSnackbar({ open: true, message: 'Paciente añadido localmente (servidor no disponible)', severity: 'warning' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const totalPatients = useMemo(
    () => patients.length,
    [patients]
  );

  const medsDue = useMemo(
    () => patients.reduce((sum, p) => sum + (p.medsDue || 0), 0),
    [patients]
  );

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

  const filteredPatients = useMemo(() => {
    if (!search) return patients;
    const query = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.cc?.toLowerCase().includes(query) ||
        p.room?.toLowerCase().includes(query) ||
        p.eps?.toLowerCase().includes(query)
    );
  }, [search, patients]);

  const handleOpenPatient = (patient) => {
    navigate(`/patient/${patient.id}`, { state: { patient, patients: patients } });
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 6, position: 'relative' }}>
      <Background />
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" fontWeight={800} color="primary">
                HOGAR SAN SEBASTIAN
              </Typography>
              
            </Box>
            <TextField
              size="small"
              placeholder="Buscar por paciente, diagnóstico o habitación"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px', minWidth: 320 },
              }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <StatCard>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    bgcolor: 'success.light',
                    color: 'success.dark',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <GroupsIcon />
                </Box>
                <Box>
                  <Typography variant="body1" color="text.secondary">
                    Pacientes ingresados
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {totalPatients}
                  </Typography>
                </Box>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    bgcolor: 'warning.light',
                    color: 'warning.dark',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <MedicationIcon />
                </Box>
                <Box>
                  <Typography variant="body1" color="text.secondary">
                    Medicación pendiente
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {medsDue}
                  </Typography>
                </Box>
              </StatCard>
            </Grid>
          </Grid>

          {/* Error/Offline Banner */}
          {error && (
            <Alert 
              severity="info" 
              sx={{ borderRadius: '12px' }}
              action={
                <IconButton size="small" onClick={fetchPatients}>
                  <RefreshIcon />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            {/* Loading State */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={48} />
              </Box>
            ) : (
              <UnitCard sx={{ backgroundColor: '#f3fbff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      Habitaciones
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pacientes en Hogar
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip icon={<GroupsIcon />} label={`${filteredPatients.length} pacientes`} color="primary" variant="outlined" />
                    <Chip icon={<AssignmentIcon />} label="Notas clínicas" variant="outlined" />
                    <Chip 
                      icon={<PersonAddIcon />} 
                      label="Nuevo paciente" 
                      color="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNewPatientModal(true);
                      }}
                      sx={{ 
                        cursor: 'pointer',
                        fontWeight: 600,
                        '&:hover': { 
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    />
                    <IconButton 
                      size="small" 
                      onClick={fetchPatients}
                      sx={{ 
                        bgcolor: 'primary.light', 
                        color: 'primary.dark',
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
                            return (
                              <Avatar 
                                src={genderMeta.avatar} 
                                sx={{ width: 48, height: 48 }} 
                              />
                            );
                          })()}
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="subtitle1" fontWeight={700} color={getGenderMeta(patient.genero, patient.id).color}>
                                  {patient.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Cama {patient.room} 
                                </Typography>
                              </Box>
                              <ArrowForwardIcon color="primary" />
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                              <Chip size="small" color="primary" label={patient.status || 'Estable'} />
                              <Chip
                                size="small"
                                variant="outlined"
                                icon={<MedicationIcon sx={{ fontSize: 16 }} />}
                                label={`${patient.medsDue || 0} dosis pendientes`}/>
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
                      {search ? 'Prueba otro nombre, diagnóstico u habitación.' : 'Haz clic en "Nuevo paciente" para agregar el primer paciente.'}
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
          backdrop: {
            timeout: 500,
            sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }
          },
        }}
      >
        <Fade in={showNewPatientModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '95%', sm: '90%', md: 800 },
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: '24px',
              boxShadow: '0 32px 100px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '16px',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    Nuevo Paciente
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Complete todos los campos requeridos
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                onClick={() => setShowNewPatientModal(false)}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Form Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              <Grid container spacing={3}>
                {/* Personal Information Section */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon sx={{ color: '#2f84e4' }} />
                    <Typography variant="h6" fontWeight={700} color="primary">
                      Información Personal
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre completo"
                    fullWidth
                    required
                    value={newPatient.nombre}
                    onChange={handleNewPatientChange('nombre')}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                    placeholder="Ingrese nombre completo"
                  />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Edad"
                    fullWidth
                    required
                    type="number"
                    value={newPatient.edad}
                    onChange={handleNewPatientChange('edad')}
                    InputProps={{ sx: { borderRadius: '12px' }, inputProps: { min: 0, max: 150 } }}
                    placeholder="Años"
                  />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    label="Género"
                    fullWidth
                    required
                    value={newPatient.genero}
                    onChange={handleNewPatientChange('genero')}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                  >
                    <MenuItem value="Masculino">Masculino</MenuItem>
                    <MenuItem value="Femenino">Femenino</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="EPS"
                    fullWidth
                    required
                    value={newPatient.eps}
                    onChange={handleNewPatientChange('eps')}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                    placeholder="Ej: Sanitas, Sura, Nueva EPS..."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Dirección"
                    fullWidth
                    value={newPatient.direccion}
                    onChange={handleNewPatientChange('direccion')}
                    InputProps={{ 
                      sx: { borderRadius: '12px' },
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Dirección de residencia"
                  />
                </Grid>

                {/* Medical Information Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 2 }}>
                    <LocalPharmacyIcon sx={{ color: '#f59e0b' }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#f59e0b' }}>
                      Información Médica
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Alergias"
                    fullWidth
                    multiline
                    rows={2}
                    value={newPatient.alergias}
                    onChange={handleNewPatientChange('alergias')}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                    placeholder="Liste las alergias conocidas (medicamentos, alimentos, etc.)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Diagnósticos"
                    fullWidth
                    multiline
                    rows={2}
                    value={newPatient.diagnosticos}
                    onChange={handleNewPatientChange('diagnosticos')}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                    placeholder="Diagnósticos actuales"
                  />
                </Grid>

                {/* Clinical History Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 2 }}>
                    <HistoryIcon sx={{ color: '#8b5cf6' }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#8b5cf6' }}>
                      Antecedentes Clínicos
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Enfermedades previas"
                    fullWidth
                    multiline
                    rows={3}
                    value={newPatient.enfermedadesPrevias}
                    onChange={handleNewPatientChange('enfermedadesPrevias')}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                    placeholder="Historial de enfermedades (diabetes, hipertensión, etc.)"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Cirugías previas"
                    fullWidth
                    multiline
                    rows={3}
                    value={newPatient.cirugias}
                    onChange={handleNewPatientChange('cirugias')}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                    placeholder="Cirugías realizadas con fechas aproximadas"
                  />
                </Grid>

                {/* Emergency Contact Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 2 }}>
                    <FamilyRestroomIcon sx={{ color: '#ef4444' }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#ef4444' }}>
                      Contacto de Emergencia
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre del acudiente"
                    fullWidth
                    required
                    value={newPatient.nombreAcudiente}
                    onChange={handleNewPatientChange('nombreAcudiente')}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                    placeholder="Nombre del familiar responsable"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Teléfono del acudiente"
                    fullWidth
                    required
                    value={newPatient.telefono}
                    onChange={handleNewPatientChange('telefono')}
                    InputProps={{ sx: { borderRadius: '12px' } }}
                    placeholder="Ej: 300 123 4567"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Footer with Actions */}
            <Box
              sx={{
                p: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'grey.50',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setShowNewPatientModal(false)}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleAddPatient}
                disabled={submitting || !newPatient.nombre || !newPatient.edad || !newPatient.eps || !newPatient.nombreAcudiente || !newPatient.telefono}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 28px rgba(16, 185, 129, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                  '&:disabled': {
                    background: '#e0e0e0',
                    boxShadow: 'none',
                  },
                }}
              >
                {submitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Registrando...
                  </Box>
                ) : (
                  'Registrar Paciente'
                )}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%', 
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Menu;

