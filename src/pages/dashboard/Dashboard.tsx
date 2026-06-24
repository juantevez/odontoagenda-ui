import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuthStore } from '../../store/auth.store';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2">{title}</Typography>
            <Typography variant="h4" fontWeight={600} sx={{ mt: 1 }}>{value}</Typography>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: color, color: 'white' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const roleGreeting: Record<string, string> = {
    superadmin: 'Administrador General',
    admin_sucursal: 'Administrador de Sede',
    profesional: 'Profesional',
    recepcionista: 'Recepcionista',
    paciente: 'Paciente',
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Bienvenido, {roleGreeting[user?.role ?? 'patient']}
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        Resumen del sistema
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pacientes registrados"
            value="—"
            icon={<PeopleIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Turnos hoy"
            value="—"
            icon={<CalendarMonthIcon />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Atenciones completadas"
            value="—"
            icon={<CheckCircleIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Facturación del día"
            value="—"
            icon={<TrendingUpIcon />}
            color="warning.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
