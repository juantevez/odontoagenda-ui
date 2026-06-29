import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import Table, { type Column } from '../../components/common/Table';
import { usePatientAppointments, useCancelAppointment } from '../../hooks/useAppointments';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDateTime } from '../../utils/formatters';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '../../utils/constants';
import { apptCode, procedureLabel } from '../../utils/appointmentCode';
import type { Appointment } from '../../types/appointment.types';

const CANCELLABLE = new Set(['scheduled', 'confirmed']);

interface CancelState {
  appointment: Appointment;
  reason: string;
}

export default function AppointmentList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const { isPatient } = usePermissions();

  const urlPatientId = searchParams.get('patient_id') ?? '';
  const patientId = urlPatientId || (isPatient ? (user?.patient_id ?? '') : '');

  const { data, isLoading } = usePatientAppointments(patientId);
  const cancelMutation = useCancelAppointment();

  const [cancelState, setCancelState] = useState<CancelState | null>(null);

  const handleCancelConfirm = async () => {
    if (!cancelState) return;
    await cancelMutation.mutateAsync({
      id: cancelState.appointment.appointment_id,
      data: {
        reason: isPatient ? 'patient_request' : 'staff_request',
        note: cancelState.reason || undefined,
      },
    });
    setCancelState(null);
  };

  const columns: Column<Appointment>[] = [
    {
      key: 'code',
      label: 'Código',
      render: (a) => (
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ fontFamily: 'monospace', letterSpacing: 1, color: 'primary.main', whiteSpace: 'nowrap' }}
        >
          {apptCode(a.appointment_id, a.slot_start, a.procedure_code)}
        </Typography>
      ),
    },
    {
      key: 'slot_start',
      label: 'Fecha y hora',
      render: (a) => formatDateTime(a.slot_start),
    },
    {
      key: 'procedure_name',
      label: 'Procedimiento',
      render: (a) => procedureLabel(a.procedure_code),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (a) => (
        <Chip
          label={APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
          color={APPOINTMENT_STATUS_COLORS[a.status] ?? 'default'}
          size="small"
        />
      ),
    },
    {
      key: 'appointment_id',
      label: '',
      render: (a) =>
        CANCELLABLE.has(a.status) ? (
          <Tooltip title="Cancelar turno">
            <IconButton
              size="small"
              color="error"
              onClick={() => setCancelState({ appointment: a, reason: '' })}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Turnos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/appointments/new')}
        >
          Nuevo turno
        </Button>
      </Box>

      <Table
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(a) => a.appointment_id}
        isLoading={isLoading}
        emptyMessage="No hay turnos registrados"
      />

      <Dialog
        open={Boolean(cancelState)}
        onClose={() => !cancelMutation.isPending && setCancelState(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Cancelar turno</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            ¿Confirmás la cancelación del turno del{' '}
            <strong>{cancelState ? formatDateTime(cancelState.appointment.slot_start) : ''}</strong>
            {' '}con <strong>{cancelState?.appointment.professional_name}</strong>?
          </DialogContentText>
          <TextField
            label="Motivo (opcional)"
            fullWidth
            multiline
            rows={2}
            value={cancelState?.reason ?? ''}
            onChange={(e) =>
              setCancelState((s) => s && { ...s, reason: e.target.value })
            }
            disabled={cancelMutation.isPending}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setCancelState(null)}
            disabled={cancelMutation.isPending}
          >
            Volver
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelConfirm}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? 'Cancelando...' : 'Confirmar cancelación'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
