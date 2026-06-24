import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useQuery } from '@tanstack/react-query';
import Table, { type Column } from '../../components/common/Table';
import { billingApi } from '../../api/billing.api';
import { formatCurrency } from '../../utils/formatters';
import type { Quote } from '../../types/billing.types';

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  paid: 'success',
  voided: 'error',
  refunded: 'default',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  voided: 'Anulado',
  refunded: 'Reembolsado',
};

export default function QuoteList() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient_id') ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['quotes', patientId],
    queryFn: () => billingApi.getPatientQuotes(patientId),
    enabled: Boolean(patientId),
  });

  const columns: Column<Quote>[] = [
    { key: 'quote_id', label: 'ID', render: (q) => q.quote_id.slice(0, 8) + '...' },
    { key: 'procedure', label: 'Procedimiento', render: (q) => q.procedure.name },
    {
      key: 'totals',
      label: 'Total',
      render: (q) => formatCurrency(q.totals.total_cents),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (q) => (
        <Chip
          label={STATUS_LABELS[q.status] ?? q.status}
          color={STATUS_COLORS[q.status] ?? 'default'}
          size="small"
        />
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>Presupuestos</Typography>
      <Table
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(q) => q.quote_id}
        isLoading={isLoading}
        emptyMessage="No hay presupuestos"
      />
    </Box>
  );
}
