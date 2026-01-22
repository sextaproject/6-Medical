import React, { useState } from 'react';
import axiosInstance from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    Paper, 
    Alert,
    CircularProgress,
    Container
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        setError(''); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Use plain axios for login to avoid interceptor issues
            const response = await axiosInstance.post('token/', formData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.data.access && response.data.refresh) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                // Store user info if available
                if (response.data.user) {
                    localStorage.setItem('user_info', JSON.stringify(response.data.user));
                }
                axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + response.data.access;
                
                navigate('/clinical');
            } else {
                setError('Respuesta del servidor inválida');
            }
        } catch (err) {
            // Error handling - no console.log in production
            if (err.response) {
                // Server responded with error
                if (err.response.status === 401) {
                    setError('Usuario o contraseña incorrectos');
                } else if (err.response.status === 400) {
                    setError(err.response.data.detail || 'Datos inválidos');
                } else {
                    setError(`Error del servidor: ${err.response.status}`);
                }
            } else if (err.request) {
                // Request was made but no response received
                setError('No se pudo conectar al servidor. Verifique que el servidor esté ejecutándose.');
            } else {
                // Something else happened
                setError('Error inesperado. Por favor intente nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: '#f5f7fa',
            backgroundImage: `linear-gradient(#1E88E5 1px, transparent 1px), linear-gradient(90deg, #1E88E5 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundBlendMode: 'overlay',
        }}>
            <Container component="main" maxWidth="xs">
                <Paper 
                    elevation={6}
                    sx={{ 
                        p: 4, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        borderRadius: 4
                    }}
                >
                    <Box sx={{ 
                        m: 1, 
                        bgcolor: 'primary.main', 
                        width: 50, 
                        height: 50, 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <LocalHospitalIcon sx={{ color: 'white' }} />
                    </Box>
                    
                    <Typography component="h1" variant="h5" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
                        SEXTA MEDICAL
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Usuario"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formData.username}
                            onChange={handleChange}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit"/> : 'Ingresar'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}