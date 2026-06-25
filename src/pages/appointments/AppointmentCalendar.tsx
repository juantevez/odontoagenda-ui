import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDaySchedule, usePatientAppointments } from '../../hooks/useAppointments';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '../../utils/constants';
import { formatTime } from '../../utils/formatters';

const DEFAULT_CLINIC_ID = 'a1000000-0000-0000-0000-000000000001';

export default function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const user = useAuthStore((s) => s.user);
  const { isPatient } = usePermissions();

  const clinicId = user?.clinic_ids?.[0] ?? DEFAULT_CLINIC_ID;
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Paciente: ver sus propios turnos; staff: ver agenda de la sede.
  const patientAppts = usePatientAppointments(
    isPatient ? (user?.patient_id ?? '') : '',
  );
  const daySchedule = useDaySchedule({
    clinic_id: clinicId,
    date: format(selectedDate, 'yyyy-MM-dd'),
  });

  const isLoading = isPatient ? patientAppts.isLoading : daySchedule.isLoading;

  // Para paciente: filtrar por fecha seleccionada. Para staff: usar la agenda del día.
  const entries = isPatient
    ? (patientAppts.data?.items ?? [])
        .filter((a) => a.slot_start.startsWith(format(selectedDate, 'yyyy-MM-dd')))
        .map((a) => ({
          appointment_id: a.appointment_id,
          slot_start: a.slot_start,
          slot_end: a.slot_end,
          patient_name: a.patient_name,
          procedure_name: a.procedure_name,
          status: a.status,
        }))
    : (daySchedule.data?.entries ?? []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Calendario de Turnos</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => setSelectedDate((d) => addDays(d, -7))}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography>
            {format(weekStart, "d 'de' MMMM", { locale: es })}
          </Typography>
          <IconButton onClick={() => setSelectedDate((d) => addDays(d, 7))}>
            <ChevronRightIcon />
          </IconButton>
          <Button variant="outlined" size="small" onClick={() => setSelectedDate(new Date())}>
            Hoy
          </Button>
        </Box>
      </Box>

      <Grid container spacing={1} sx={{ mb: 2 }}>
        {weekDays.map((day) => (
          <Grid item xs key={day.toISOString()}>
            <Button
              fullWidth
              variant={isSameDay(day, selectedDate) ? 'contained' : 'outlined'}
              onClick={() => setSelectedDate(day)}
              sx={{ flexDirection: 'column', py: 1 }}
            >
              <Typography variant="caption">{format(day, 'EEE', { locale: es })}</Typography>
              <Typography variant="h6">{format(day, 'd')}</Typography>
            </Button>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
        </Typography>
        {isLoading ? (
          <Typography color="text.secondary">Cargando...</Typography>
        ) : entries.length === 0 ? (
          <Typography color="text.secondary">No hay turnos para este día</Typography>
        ) : (
          entries.map((entry) => (
            <Box
              key={entry.appointment_id}
              sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}
            >
              <Typography sx={{ minWidth: 100 }} color="text.secondary">
                {formatTime(entry.slot_start)} - {formatTime(entry.slot_end)}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={500}>{entry.patient_name}</Typography>
                <Typography variant="caption" color="text.secondary">{entry.procedure_name}</Typography>
              </Box>
              <Chip
                label={APPOINTMENT_STATUS_LABELS[entry.status]}
                color={APPOINTMENT_STATUS_COLORS[entry.status]}
                size="small"
              />
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
}
