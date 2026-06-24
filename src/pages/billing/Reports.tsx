import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { billingApi } from '../../api/billing.api';
import { formatCurrency } from '../../utils/formatters';

export default function Reports() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['billing-report', date],
    queryFn: () => billingApi.getDailyReport(date),
    enabled: false,
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>Reporte Diario</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end' }}>
        <TextField
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Generar reporte'}
        </Button>
      </Box>

      {data && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary" variant="body2">Turnos atendidos</Typography>
              <Typography variant="h4" fontWeight={600}>{data.appointments_completed ?? 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary" variant="body2">Facturación total</Typography>
              <Typography variant="h4" fontWeight={600}>
                {formatCurrency(data.total_revenue_cents ?? 0)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary" variant="body2">Pagos cobrados</Typography>
              <Typography variant="h4" fontWeight={600}>
                {formatCurrency(data.total_collected_cents ?? 0)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
