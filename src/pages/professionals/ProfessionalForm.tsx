import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalApi } from '../../api/professional.api';

const schema = z.object({
  full_name: z.string().min(3, 'Nombre muy corto'),
  doc_type: z.string().min(1),
  doc_number: z.string().min(7),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10),
  bio: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfessionalForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => professionalApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      navigate('/professionals');
    },
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Volver</Button>
        <Typography variant="h5" fontWeight={600}>Nuevo profesional</Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit((d) => mutation.mutate(d))} sx={{ maxWidth: 700 }}>
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>{mutation.error?.message}</Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField {...register('full_name')} label="Nombre completo" fullWidth required
              error={Boolean(errors.full_name)} helperText={errors.full_name?.message} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField {...register('doc_type')} label="Tipo doc." fullWidth required
              error={Boolean(errors.doc_type)} helperText={errors.doc_type?.message} />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField {...register('doc_number')} label="Número documento" fullWidth required
              error={Boolean(errors.doc_number)} helperText={errors.doc_number?.message} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('email')} label="Email" type="email" fullWidth required
              error={Boolean(errors.email)} helperText={errors.email?.message} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('phone')} label="Teléfono" fullWidth required
              error={Boolean(errors.phone)} helperText={errors.phone?.message} />
          </Grid>
          <Grid item xs={12}>
            <TextField {...register('bio')} label="Biografía / Especialidad" fullWidth multiline rows={3} />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar profesional'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
