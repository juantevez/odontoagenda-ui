import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Loading from '../../components/common/Loading';
import { usePatient } from '../../hooks/usePatients';
import { formatDate } from '../../utils/formatters';
import type { PatientDetail as PatientDetailType } from '../../types/patient.types';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient(id ?? '');

  if (isLoading) return <Loading />;
  if (!patient) return <Typography>Paciente no encontrado</Typography>;

  const p = patient as unknown as PatientDetailType;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Typography variant="h5" fontWeight={600}>{p.full_name}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Datos personales</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={1}>
              {[
                ['Documento', `${p.national_id?.type ?? '—'} ${p.national_id?.number ?? '—'}`],
                ['Fecha nacimiento', formatDate(p.birth_date)],
                ['Edad', `${p.age_years} años${p.is_minor ? ' (menor)' : ''}`],
                ['Género', p.gender],
                ['Teléfono', p.contact_info?.phone ?? '—'],
                ['Email', p.contact_info?.email ?? '—'],
              ].map(([label, value]) => (
                <Grid item xs={12} key={label}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography color="text.secondary" sx={{ minWidth: 140 }}>{label}:</Typography>
                    <Typography>{value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Contacto de emergencia</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography color="text.secondary" sx={{ minWidth: 140 }}>Nombre:</Typography>
              <Typography>{p.contact_info?.emergency_name || '—'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography color="text.secondary" sx={{ minWidth: 140 }}>Teléfono:</Typography>
              <Typography>{p.contact_info?.emergency_phone || '—'}</Typography>
            </Box>
          </Paper>
        </Grid>

        {p.active_alerts?.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderLeft: '4px solid', borderColor: 'warning.main' }}>
              <Typography variant="h6" gutterBottom color="warning.main">Alertas médicas</Typography>
              <Divider sx={{ mb: 2 }} />
              {p.active_alerts.map((alert) => (
                <Box key={alert.alert_id} sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{alert.alert_type} — {alert.severity}</Typography>
                  <Typography variant="body2" color="text.secondary">{alert.description}</Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<CalendarMonthIcon />}
            onClick={() => navigate(`/appointments/new?patient_id=${p.id}`)}
          >
            Nuevo turno
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
