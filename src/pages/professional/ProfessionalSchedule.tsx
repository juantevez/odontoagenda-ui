import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format, addDays, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDaySchedule, useCheckIn, useCompleteAppointment, useCancelAppointment } from '../../hooks/useAppointments';
import { useProfessionals } from '../../hooks/useAppointments';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS, specialtyLabel } from '../../utils/constants';
import { formatTime } from '../../utils/formatters';
import { apptCode, patientCode } from '../../utils/appointmentCode';
import type { DayScheduleEntry } from '../../types/appointment.types';

const DEFAULT_CLINIC_ID = 'a1000000-0000-0000-0000-000000000001';

const STATUS_BG: Record<string, string> = {
  Confirmed:  'background.paper',
  InProgress: 'success.50',
  Completed:  'info.50',
  Cancelled:  'error.50',
  NoShow:     'warning.50',
};

interface CompleteState {
  entry: DayScheduleEntry;
  notes: string;
}

interface CancelState {
  entry: DayScheduleEntry;
  reason: string;
}

export default function ProfessionalSchedule() {
  const user = useAuthStore((s) => s.user);
  const { isStaff, isProfessional } = usePermissions();
  const clinicId = user?.clinic_ids?.[0] ?? DEFAULT_CLINIC_ID;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProfId, setSelectedProfId] = useState('');
  const [completeState, setCompleteState] = useState<CompleteState | null>(null);
  const [cancelState, setCancelState] = useState<CancelState | null>(null);

  const { data: professionals, isLoading: profsLoading } = useProfessionals(clinicId);

  // Auto-select first professional when list loads
  const effectiveProfId = selectedProfId || professionals?.[0]?.id || '';

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { data: schedule, isLoading: scheduleLoading, refetch } = useDaySchedule(
    { professional_id: effectiveProfId, clinic_id: clinicId, date: dateStr },
    { refetchInterval: 30_000 }
  );

  const checkIn = useCheckIn();
  const complete = useCompleteAppointment();
  const cancel = useCancelAppointment();

  const allEntries = schedule?.entries ?? [];
  const entries = allEntries.filter((e) => e.status !== 'Cancelled' && e.status !== 'NoShow');

  const handleComplete = async () => {
    if (!completeState) return;
    await complete.mutateAsync({ id: completeState.entry.appointment_id, clinicalNotes: completeState.notes });
    setCompleteState(null);
  };

  const handleCancel = async () => {
    if (!cancelState) return;
    await cancel.mutateAsync({
      id: cancelState.entry.appointment_id,
      data: {
        reason: isStaff ? 'staff_request' : 'patient_request',
        note: cancelState.reason || undefined,
      },
    });
    setCancelState(null);
  };

  const selectedProf = professionals?.find((p) => p.id === effectiveProfId);
  const todayLabel = isToday(selectedDate) ? ' (hoy)' : '';
  const dateLabel = format(selectedDate, "EEEE d 'de' MMMM", { locale: es });

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>Agenda Clínica</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {dateLabel}{todayLabel}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Professional selector — visible for staff; professionals see only their own */}
          {isStaff && (
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Profesional</InputLabel>
              <Select
                label="Profesional"
                value={effectiveProfId}
                onChange={(e) => setSelectedProfId(e.target.value)}
                disabled={profsLoading}
              >
                {(professionals ?? []).map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {isProfessional && selectedProf && (
            <Typography fontWeight={500}>{selectedProf.full_name}</Typography>
          )}

          {/* Date navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" onClick={() => setSelectedDate((d) => addDays(d, -1))}>
              <ChevronLeftIcon />
            </IconButton>
            <Button
              size="small"
              variant={isToday(selectedDate) ? 'contained' : 'outlined'}
              onClick={() => setSelectedDate(new Date())}
              sx={{ minWidth: 60, fontSize: 12 }}
            >
              Hoy
            </Button>
            <IconButton size="small" onClick={() => setSelectedDate((d) => addDays(d, 1))}>
              <ChevronRightIcon />
            </IconButton>
          </Box>

          <Tooltip title="Actualizar">
            <IconButton size="small" onClick={() => refetch()}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary chips */}
      {!scheduleLoading && (entries.length > 0 || allEntries.length > 0) && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={`${entries.length} turnos`} size="small" variant="outlined" />
          <Chip label={`${entries.filter((e) => e.status === 'InProgress').length} en sala`} size="small" color="success" variant="outlined" />
          <Chip label={`${entries.filter((e) => e.status === 'Completed').length} completados`} size="small" color="info" variant="outlined" />
          {allEntries.filter((e) => e.status === 'Cancelled' || e.status === 'NoShow').length > 0 && (
            <Chip
              label={`${allEntries.filter((e) => e.status === 'Cancelled' || e.status === 'NoShow').length} cancelados/ausentes`}
              size="small"
              color="error"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Schedule list */}
      <Paper variant="outlined">
        {scheduleLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ px: 2, py: 1.5, borderBottom: i < 4 ? '1px solid' : 'none', borderColor: 'divider' }}>
              <Skeleton width="60%" />
              <Skeleton width="40%" />
            </Box>
          ))
        ) : entries.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">Sin turnos para este día</Typography>
          </Box>
        ) : (
          entries.map((entry, i) => (
            <Box
              key={entry.appointment_id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1.5,
                borderBottom: i < entries.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                bgcolor: STATUS_BG[entry.status] ?? 'background.paper',
                transition: 'background 0.2s',
              }}
            >
              {/* Time */}
              <Typography
                sx={{ minWidth: 105, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}
                color="text.secondary"
              >
                {formatTime(entry.slot_start)} – {formatTime(entry.slot_end)}
              </Typography>

              {/* Patient & procedure */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    noWrap
                    sx={{ fontFamily: 'monospace', letterSpacing: 0.8, color: 'primary.main' }}
                  >
                    {apptCode(entry.appointment_id, entry.slot_start, entry.procedure_name)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {patientCode(entry.patient_name)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {specialtyLabel(entry.procedure_name)}
                </Typography>
              </Box>

              {/* Status chip */}
              <Chip
                label={APPOINTMENT_STATUS_LABELS[entry.status] ?? entry.status}
                color={APPOINTMENT_STATUS_COLORS[entry.status] ?? 'default'}
                size="small"
                sx={{ minWidth: 90 }}
              />

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {/* Dar presente: Confirmed → InProgress */}
                {entry.status === 'Confirmed' && isStaff && (
                  <Tooltip title="Dar presente">
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => checkIn.mutate(entry.appointment_id)}
                      disabled={checkIn.isPending}
                    >
                      <HowToRegIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Finalizar atención: InProgress → Completed */}
                {entry.status === 'InProgress' && (isStaff || isProfessional) && (
                  <Tooltip title="Finalizar atención">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => setCompleteState({ entry, notes: '' })}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Cancelar: Confirmed o InProgress */}
                {(entry.status === 'Confirmed' || entry.status === 'InProgress') && (
                  <Tooltip title="Cancelar turno">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setCancelState({ entry, reason: '' })}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          ))
        )}
      </Paper>

      {/* Dialog: Finalizar atención */}
      <Dialog
        open={Boolean(completeState)}
        onClose={() => !complete.isPending && setCompleteState(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Finalizar atención</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {completeState && `${formatTime(completeState.entry.slot_start)} — ${specialtyLabel(completeState.entry.procedure_name)}`}
          </Typography>
          <TextField
            label="Notas clínicas (opcional)"
            multiline
            rows={3}
            fullWidth
            value={completeState?.notes ?? ''}
            onChange={(e) => setCompleteState((s) => s && { ...s, notes: e.target.value })}
            disabled={complete.isPending}
            placeholder="Observaciones, indicaciones, próxima cita..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteState(null)} disabled={complete.isPending}>Cancelar</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleComplete}
            disabled={complete.isPending}
          >
            {complete.isPending ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Cancelar turno */}
      <Dialog
        open={Boolean(cancelState)}
        onClose={() => !cancel.isPending && setCancelState(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Cancelar turno</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {cancelState && `${formatTime(cancelState.entry.slot_start)} — ${specialtyLabel(cancelState.entry.procedure_name)}`}
          </Typography>
          <TextField
            label="Motivo (opcional)"
            fullWidth
            size="small"
            value={cancelState?.reason ?? ''}
            onChange={(e) => setCancelState((s) => s && { ...s, reason: e.target.value })}
            disabled={cancel.isPending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelState(null)} disabled={cancel.isPending}>Volver</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={cancel.isPending}
          >
            {cancel.isPending ? 'Cancelando...' : 'Confirmar cancelación'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
