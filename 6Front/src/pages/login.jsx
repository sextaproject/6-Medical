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
        try {
            const response = await axiosInstance.post('token/', formData);          
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + response.data.access;
            
            navigate('/clinical');
        } catch (err) {
            console.error(err);
            setError('Usuario o contraseña incorrectos');
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