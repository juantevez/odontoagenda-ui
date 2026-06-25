import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';
import { patientApi } from '../../api/patient.api';
import { schedulingApi } from '../../api/scheduling.api';
import { usePatientAppointments } from '../../hooks/useAppointments';

const DEFAULT_CLINIC_ID = 'a1000000-0000-0000-0000-000000000001';

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function StatCard({ title, value, icon, color, loading }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2">{title}</Typography>
            {loading ? (
              <Skeleton variant="text" width={60} height={56} />
            ) : (
              <Typography variant="h4" fontWeight={600} sx={{ mt: 1 }}>{value}</Typography>
            )}
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
  const { isPatient } = usePermissions();

  const roleGreeting: Record<string, string> = {
    superadmin: 'Administrador General',
    admin_sucursal: 'Administrador de Sede',
    profesional: 'Profesional',
    recepcionista: 'Recepcionista',
    paciente: 'Paciente',
  };

  // Staff: total de pacientes
  const { data: patientData, isLoading: loadingPatients } = useQuery({
    queryKey: ['dashboard', 'patients-total'],
    queryFn: () => patientApi.search({ limit: 1 }),
    enabled: !isPatient,
  });

  // Staff: turnos del día
  const { data: daySchedule, isLoading: loadingSchedule } = useQuery({
    queryKey: ['dashboard', 'day-schedule', todayStr()],
    queryFn: () => schedulingApi.getDaySchedule({ clinic_id: DEFAULT_CLINIC_ID, date: todayStr() }),
    enabled: !isPatient,
  });

  // Paciente: sus propios turnos
  const patientId = user?.patient_id ?? '';
  const { data: myApptsData, isLoading: loadingMyAppts } = usePatientAppointments(
    isPatient ? patientId : '',
  );
  const myAppointments = myApptsData?.items ?? [];

  const activeAppts = myAppointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'completed',
  );

  const dateLabel = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (isPatient) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Bienvenido, Paciente
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {dateLabel}
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Mis turnos activos"
              value={activeAppts.length}
              icon={<CalendarMonthIcon />}
              color="primary.main"
              loading={loadingMyAppts}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total de turnos"
              value={myAppointments.length}
              icon={<EventNoteIcon />}
              color="info.main"
              loading={loadingMyAppts}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Atenciones completadas"
              value={myAppointments.filter((a) => a.status === 'completed').length}
              icon={<CheckCircleIcon />}
              color="success.main"
              loading={loadingMyAppts}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Bienvenido, {roleGreeting[user?.role ?? ''] ?? 'Usuario'}
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        {dateLabel}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pacientes registrados"
            value={patientData?.total ?? 0}
            icon={<PeopleIcon />}
            color="primary.main"
            loading={loadingPatients}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Turnos hoy"
            value={daySchedule?.total_booked ?? 0}
            icon={<CalendarMonthIcon />}
            color="info.main"
            loading={loadingSchedule}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Atenciones completadas"
            value={daySchedule?.completed_count ?? 0}
            icon={<CheckCircleIcon />}
            color="success.main"
            loading={loadingSchedule}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Profesionales activos"
            value="—"
            icon={<EventNoteIcon />}
            color="warning.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
