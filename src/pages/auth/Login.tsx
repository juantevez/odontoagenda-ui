import { useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { loginSchema, type LoginFormData } from '../../utils/validators';
import { useAuthStore } from '../../store/auth.store';

function ToothIllustration() {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 380, height: 'auto' }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1565c0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0d47a1" stopOpacity="0" />
        </radialGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <style>{`
          @keyframes spin-cw {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes spin-ccw {
            from { transform: rotate(0deg); }
            to   { transform: rotate(-360deg); }
          }
          @keyframes pulse-ring {
            0%, 100% { opacity: 0.15; }
            50%       { opacity: 0.45; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-8px); }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0.5); }
            50%       { opacity: 1;  transform: scale(1); }
          }

          .ring-cw  { transform-origin: 200px 200px; animation: spin-cw  14s linear infinite; }
          .ring-ccw { transform-origin: 200px 200px; animation: spin-ccw 10s linear infinite; }
          .ring-cw2 { transform-origin: 200px 200px; animation: spin-cw  20s linear infinite; }
          .ring-pulse { animation: pulse-ring 3s ease-in-out infinite; }
          .tooth-group { transform-origin: 200px 200px; animation: float 4s ease-in-out infinite; }
          .spark1 { animation: sparkle 2.4s ease-in-out infinite; }
          .spark2 { animation: sparkle 2.4s ease-in-out 0.8s infinite; }
          .spark3 { animation: sparkle 2.4s ease-in-out 1.6s infinite; }
        `}</style>
      </defs>

      {/* fondo radial difuso */}
      <circle cx="200" cy="200" r="180" fill="url(#bgGrad)" />

      {/* anillo exterior punteado girando CW */}
      <g className="ring-cw2">
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const r = 175;
          const x = 200 + r * Math.cos(angle);
          const y = 200 + r * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i % 3 === 0 ? 2.5 : 1.2}
              fill="rgba(100,180,255,0.5)"
            />
          );
        })}
      </g>

      {/* arcos segmentados girando CCW */}
      <g className="ring-ccw" filter="url(#glow)">
        {[0, 60, 120, 180, 240, 300].map((startDeg, i) => (
          <path
            key={i}
            d={describeArc(200, 200, 148, startDeg, startDeg + 42)}
            stroke="rgba(100,200,255,0.55)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* arcos segmentados más cortos girando CW */}
      <g className="ring-cw" filter="url(#glow)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((startDeg, i) => (
          <path
            key={i}
            d={describeArc(200, 200, 120, startDeg, startDeg + 28)}
            stroke="rgba(150,220,255,0.45)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* anillo pulsante estático */}
      <circle
        className="ring-pulse"
        cx="200"
        cy="200"
        r="160"
        stroke="rgba(100,170,255,0.3)"
        strokeWidth="1"
        fill="none"
        strokeDasharray="6 6"
      />
      <circle
        className="ring-pulse"
        cx="200"
        cy="200"
        r="95"
        stroke="rgba(180,220,255,0.2)"
        strokeWidth="1"
        fill="none"
      />

      {/* muela flotante */}
      <g className="tooth-group">
        {/* sombra suave */}
        <ellipse cx="200" cy="262" rx="46" ry="8" fill="rgba(0,0,0,0.18)" />

        {/* cuerpo de la muela — forma simplificada */}
        <path
          d="
            M165 195
            C162 172, 170 155, 185 150
            C192 147, 197 152, 200 156
            C203 152, 208 147, 215 150
            C230 155, 238 172, 235 195
            C233 210, 228 230, 224 248
            C221 260, 218 265, 215 265
            C212 265, 210 260, 208 255
            C206 250, 204 248, 200 248
            C196 248, 194 250, 192 255
            C190 260, 188 265, 185 265
            C182 265, 179 260, 176 248
            C172 230, 167 210, 165 195
            Z
          "
          fill="white"
          stroke="rgba(200,220,255,0.4)"
          strokeWidth="1"
          filter="url(#glow)"
        />

        {/* reflejo superior izquierdo */}
        <path
          d="M175 162 C178 156, 185 153, 190 157 C186 162, 180 165, 175 162 Z"
          fill="rgba(255,255,255,0.7)"
        />

        {/* surco central de la muela */}
        <path
          d="M192 200 C194 208, 200 212, 206 208 C208 205, 207 200, 204 197 C201 194, 198 194, 196 197 Z"
          fill="rgba(200,215,235,0.5)"
        />
      </g>

      {/* destellos */}
      <g className="spark1">
        <line x1="158" y1="155" x2="158" y2="163" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="154" y1="159" x2="162" y2="159" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g className="spark2">
        <line x1="244" y1="165" x2="244" y2="171" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="241" y1="168" x2="247" y2="168" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g className="spark3">
        <line x1="172" y1="145" x2="172" y2="149" stroke="rgba(200,240,255,0.9)" strokeWidth="1" strokeLinecap="round" />
        <line x1="170" y1="147" x2="174" y2="147" stroke="rgba(200,240,255,0.9)" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Genera un arco SVG entre dos ángulos (en grados) sobre un círculo centrado en (cx,cy) con radio r */
function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await login(data);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Panel izquierdo — ilustración */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #0288d1 100%)',
          px: 6,
          gap: 4,
        }}
      >
        <ToothIllustration />

        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, letterSpacing: 1 }}
          >
            OdontoAgenda
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.8, fontWeight: 300 }}>
            Sistema de Reservas Odontológicas
          </Typography>
        </Box>
      </Box>

      {/* Panel derecho — formulario */}
      <Box
        sx={{
          width: { xs: '100%', md: 420 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 4, sm: 6 },
          bgcolor: 'background.paper',
        }}
      >
        {/* Logo visible solo en móvil */}
        <Box sx={{ display: { md: 'none' }, textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" fontWeight={700} color="primary">
            OdontoAgenda
          </Typography>
        </Box>

        <Typography variant="h5" fontWeight={600} gutterBottom>
          Bienvenido
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Ingresá tus credenciales para continuar
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            {...register('email')}
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            autoComplete="email"
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
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to="/register" variant="body2">
            ¿No tiene cuenta? Registrarse
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
