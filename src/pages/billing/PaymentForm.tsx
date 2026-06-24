import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery, useMutation } from '@tanstack/react-query';
import PaymentFormComponent from '../../components/forms/PaymentForm';
import Loading from '../../components/common/Loading';
import { billingApi } from '../../api/billing.api';
import type { RegisterPaymentCommand } from '../../types/billing.types';

export default function PaymentFormPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();

  const { data: quote, isLoading } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => billingApi.getQuote(quoteId!),
    enabled: Boolean(quoteId),
  });

  const mutation = useMutation({
    mutationFn: (data: RegisterPaymentCommand) => billingApi.registerPayment(quoteId!, data),
    onSuccess: () => navigate('/billing'),
  });

  if (isLoading) return <Loading />;
  if (!quote) return <Alert severity="error">Presupuesto no encontrado</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Volver</Button>
        <Typography variant="h5" fontWeight={600}>Registrar pago</Typography>
      </Box>

      <Box sx={{ maxWidth: 600 }}>
        <PaymentFormComponent
          totalCents={quote.totals.total_cents}
          onSubmit={async (data) => { await mutation.mutateAsync(data); }}
          isLoading={mutation.isPending}
          error={mutation.error?.message}
        />
      </Box>
    </Box>
  );
}
