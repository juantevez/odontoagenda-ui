import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { appointmentSchema, type AppointmentFormData } from '../../utils/validators';
import { formatTime } from '../../utils/formatters';
import type { TimeSlot } from '../../types/appointment.types';

interface AppointmentFormProps {
  patientId: string;
  professionals: Array<{ professional_id: string; full_name: string }>;
  clinics: Array<{ clinic_id: string; name: string }>;
  procedures: Array<{ code: string; name: string }>;
  slots: TimeSlot[];
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function AppointmentForm({
  patientId,
  professionals,
  clinics,
  procedures,
  slots,
  onSubmit,
  isLoading,
  error,
}: AppointmentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { patient_id: patientId },
  });

  const selectedSlotStart = watch('slot_start');

  const handleSlotSelect = (slot: TimeSlot) => {
    setValue('slot_start', slot.start);
    setValue('slot_end', slot.end);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('professional_id')}
            select
            label="Profesional"
            fullWidth
            defaultValue=""
            error={Boolean(errors.professional_id)}
            helperText={errors.professional_id?.message}
            required
          >
            {professionals.map((p) => (
              <MenuItem key={p.professional_id} value={p.professional_id}>{p.full_name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('clinic_id')}
            select
            label="Sede"
            fullWidth
            defaultValue=""
            error={Boolean(errors.clinic_id)}
            helperText={errors.clinic_id?.message}
            required
          >
            {clinics.map((c) => (
              <MenuItem key={c.clinic_id} value={c.clinic_id}>{c.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register('procedure_code')}
            select
            label="Procedimiento"
            fullWidth
            defaultValue=""
            error={Boolean(errors.procedure_code)}
            helperText={errors.procedure_code?.message}
            required
          >
            {procedures.map((p) => (
              <MenuItem key={p.code} value={p.code}>{p.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        {slots.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Horarios disponibles</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {slots.map((slot) => (
                <Chip
                  key={slot.start}
                  label={`${formatTime(slot.start)} - ${formatTime(slot.end)}`}
                  onClick={() => slot.available && handleSlotSelect(slot)}
                  disabled={!slot.available}
                  color={selectedSlotStart === slot.start ? 'primary' : 'default'}
                  variant={selectedSlotStart === slot.start ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
            {errors.slot_start && (
              <Typography variant="caption" color="error">{errors.slot_start.message}</Typography>
            )}
          </Grid>
        )}
        <Grid item xs={12}>
          <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
            {isLoading ? 'Reservando...' : 'Confirmar turno'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
