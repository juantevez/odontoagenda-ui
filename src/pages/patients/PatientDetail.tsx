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

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient(id!);

  if (isLoading) return <Loading />;
  if (!patient) return <Typography>Paciente no encontrado</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Typography variant="h5" fontWeight={600}>{patient.full_name}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Datos personales</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={1}>
              {[
                ['Documento', `${patient.doc_type} ${patient.doc_number}`],
                ['Fecha nacimiento', formatDate(patient.birth_date)],
                ['Género', patient.gender],
                ['Teléfono', patient.phone],
                ['Email', patient.email || '—'],
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
              <Typography>{patient.emergency_name || '—'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography color="text.secondary" sx={{ minWidth: 140 }}>Teléfono:</Typography>
              <Typography>{patient.emergency_phone || '—'}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CalendarMonthIcon />}
              onClick={() => navigate(`/appointments/new?patient_id=${patient.patient_id}`)}
            >
              Nuevo turno
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
