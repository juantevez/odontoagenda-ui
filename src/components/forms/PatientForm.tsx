import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { patientSchema, type PatientFormData } from '../../utils/validators';
import { DOC_TYPES, GENDERS } from '../../utils/constants';

interface PatientFormProps {
  onSubmit: (data: PatientFormData) => Promise<void>;
  defaultValues?: Partial<PatientFormData>;
  isLoading?: boolean;
  error?: string | null;
}

export default function PatientForm({ onSubmit, defaultValues, isLoading, error }: PatientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues,
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            {...register('full_name')}
            label="Nombre completo"
            fullWidth
            error={Boolean(errors.full_name)}
            helperText={errors.full_name?.message}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('birth_date')}
            label="Fecha de nacimiento"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={Boolean(errors.birth_date)}
            helperText={errors.birth_date?.message}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('gender')}
            select
            label="Género"
            fullWidth
            defaultValue=""
            error={Boolean(errors.gender)}
            helperText={errors.gender?.message}
            required
          >
            {GENDERS.map((g) => (
              <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            {...register('doc_type')}
            select
            label="Tipo documento"
            fullWidth
            defaultValue=""
            error={Boolean(errors.doc_type)}
            helperText={errors.doc_type?.message}
            required
          >
            {DOC_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            {...register('doc_number')}
            label="Número de documento"
            fullWidth
            error={Boolean(errors.doc_number)}
            helperText={errors.doc_number?.message}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('phone')}
            label="Teléfono"
            fullWidth
            placeholder="+5491112345678"
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('email')}
            label="Email"
            type="email"
            fullWidth
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('emergency_name')}
            label="Contacto de emergencia"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('emergency_phone')}
            label="Teléfono de emergencia"
            fullWidth
            placeholder="+5491112345678"
            error={Boolean(errors.emergency_phone)}
            helperText={errors.emergency_phone?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar paciente'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
