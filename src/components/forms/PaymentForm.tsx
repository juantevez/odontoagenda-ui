import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { PAYMENT_METHODS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import type { RegisterPaymentCommand } from '../../types/billing.types';

const paymentSchema = z.object({
  amount_cents: z.number().positive('El monto debe ser mayor a 0'),
  payment_method: z.enum(['cash', 'card', 'transfer', 'mercadopago']),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  totalCents: number;
  onSubmit: (data: RegisterPaymentCommand) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function PaymentForm({ totalCents, onSubmit, isLoading, error }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount_cents: totalCents, payment_method: 'cash' },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Typography variant="h6" gutterBottom>
        Total a cobrar: {formatCurrency(totalCents)}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('amount_cents', { valueAsNumber: true })}
            label="Monto (centavos)"
            type="number"
            fullWidth
            error={Boolean(errors.amount_cents)}
            helperText={errors.amount_cents?.message}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('payment_method')}
            select
            label="Medio de pago"
            fullWidth
            defaultValue="cash"
            error={Boolean(errors.payment_method)}
            helperText={errors.payment_method?.message}
            required
          >
            {PAYMENT_METHODS.map((m) => (
              <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField {...register('notes')} label="Notas" fullWidth multiline rows={2} />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="success" fullWidth disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrar pago'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
