import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { registerSchema, type RegisterFormData } from '../../utils/validators';
import { useAuthStore } from '../../store/auth.store';
import { USER_ROLES } from '../../utils/constants';

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    await registerUser(data);
    setSuccess(true);
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'grey.100' }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" fontWeight={600} gutterBottom>
            Crear cuenta
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Cuenta creada exitosamente. Redirigiendo al login...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              {...register('email')}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              required
            />
            <TextField
              {...register('password')}
              label="Contraseña"
              type="password"
              fullWidth
              margin="normal"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              required
            />
            <TextField
              {...register('role')}
              select
              label="Rol"
              fullWidth
              margin="normal"
              defaultValue=""
              error={Boolean(errors.role)}
              helperText={errors.role?.message}
              required
            >
              {USER_ROLES.map((r) => (
                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              {...register('family_name')}
              label="Nombre familiar (opcional)"
              fullWidth
              margin="normal"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? 'Creando cuenta...' : 'Registrarse'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              ¿Ya tiene cuenta? Iniciar sesión
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
