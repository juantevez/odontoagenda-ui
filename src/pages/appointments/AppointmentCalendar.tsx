import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import CancelIcon from '@mui/icons-material/Cancel';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  format, addDays, addWeeks, addMonths,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isSameMonth, isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useQueries } from '@tanstack/react-query';
import { schedulingApi } from '../../api/scheduling.api';
import { usePatientAppointments, useDaySchedule, useCancelAppointment, useCheckIn } from '../../hooks/useAppointments';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '../../utils/constants';
import { formatTime, formatDateTime } from '../../utils/formatters';
import { apptCode, patientCode, procedureLabel } from '../../utils/appointmentCode';
import type { DayScheduleEntry } from '../../types/appointment.types';

const DEFAULT_CLINIC_ID = 'a1000000-0000-0000-0000-000000000001';

type CalendarView = 'day' | 'week' | 'month';

const VIEW_LABELS: Record<CalendarView, string> = {
  day: 'Diario',
  week: 'Semanal',
  month: 'Mensual',
};

const WEEK_HEADER = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const CANCELLABLE = new Set(['scheduled', 'confirmed', 'Scheduled', 'Confirmed']);

function EntryRow({
  entry,
  onCancel,
  onCheckIn,
}: {
  entry: DayScheduleEntry;
  onCancel?: (e: DayScheduleEntry) => void;
  onCheckIn?: (e: DayScheduleEntry) => void;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        px: 2,
        borderBottom: 1,
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <Typography sx={{ minWidth: 110, fontVariantNumeric: 'tabular-nums' }} color="text.secondary">
        {formatTime(entry.slot_start)} – {formatTime(entry.slot_end)}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ fontFamily: 'monospace', letterSpacing: 0.8, color: 'primary.main' }}
          >
            {apptCode(entry.appointment_id, entry.slot_start, entry.procedure_name)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {patientCode(entry.patient_name)}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {procedureLabel(entry.procedure_name)}
        </Typography>
      </Box>
      <Chip
        label={APPOINTMENT_STATUS_LABELS[entry.status] ?? entry.status}
        color={APPOINTMENT_STATUS_COLORS[entry.status] ?? 'default'}
        size="small"
      />
      {onCheckIn && entry.status === 'Confirmed' && (
        <Tooltip title="Dar presente">
          <IconButton size="small" color="success" onClick={() => onCheckIn(entry)}>
            <HowToRegIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onCancel && CANCELLABLE.has(entry.status) && (
        <Tooltip title="Cancelar turno">
          <IconButton size="small" color="error" onClick={() => onCancel(entry)}>
            <CancelIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

interface CancelState {
  entry: DayScheduleEntry;
  reason: string;
}

export default function AppointmentCalendar() {
  const navigate = useNavigate();
  const [view, setView] = useState<CalendarView>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cancelState, setCancelState] = useState<CancelState | null>(null);

  const cancelMutation = useCancelAppointment();
  const checkInMutation = useCheckIn();

  const user = useAuthStore((s) => s.user);
  const { isPatient, isStaff } = usePermissions();

  const handleCancelConfirm = async () => {
    if (!cancelState) return;
    await cancelMutation.mutateAsync({
      id: cancelState.entry.appointment_id,
      data: {
        reason: isPatient ? 'patient_request' : 'staff_request',
        note: cancelState.reason || undefined,
      },
    });
    setCancelState(null);
  };
  const clinicId = user?.clinic_ids?.[0] ?? DEFAULT_CLINIC_ID;

  // ── Derived ranges ────────────────────────────────────────────────
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const monthStart   = startOfMonth(selectedDate);
  const gridStart    = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd      = endOfWeek(endOfMonth(selectedDate), { weekStartsOn: 1 });
  const monthGridDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // ── Navigation ────────────────────────────────────────────────────
  const navigatePrev = () => {
    if (view === 'day')   setSelectedDate((d) => addDays(d, -1));
    if (view === 'week')  setSelectedDate((d) => addWeeks(d, -1));
    if (view === 'month') setSelectedDate((d) => addMonths(d, -1));
  };
  const navigateNext = () => {
    if (view === 'day')   setSelectedDate((d) => addDays(d, 1));
    if (view === 'week')  setSelectedDate((d) => addWeeks(d, 1));
    if (view === 'month') setSelectedDate((d) => addMonths(d, 1));
  };

  const rangeLabel = () => {
    if (view === 'day')
      return format(selectedDate, "EEEE d 'de' MMMM yyyy", { locale: es });
    if (view === 'week') {
      const wEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      if (weekStart.getMonth() === wEnd.getMonth())
        return `${format(weekStart, 'd')} – ${format(wEnd, "d 'de' MMMM yyyy", { locale: es })}`;
      return `${format(weekStart, "d MMM", { locale: es })} – ${format(wEnd, "d MMM yyyy", { locale: es })}`;
    }
    return format(selectedDate, "MMMM yyyy", { locale: es });
  };

  // ── Data fetching ─────────────────────────────────────────────────

  // Paciente: todos sus turnos de una vez.
  const patientAppts = usePatientAppointments(
    isPatient ? (user?.patient_id ?? '') : '',
  );

  // Staff — día seleccionado (vistas diaria y mensual).
  const singleDay = useDaySchedule({
    clinic_id: isPatient ? undefined : clinicId,
    date: format(selectedDate, 'yyyy-MM-dd'),
  });

  // Staff — 7 días para vista semanal.
  const weekQueries = useQueries({
    queries: weekDays.map((day) => ({
      queryKey: ['day-schedule', { clinic_id: clinicId, date: format(day, 'yyyy-MM-dd') }],
      queryFn: () => schedulingApi.getDaySchedule({ clinic_id: clinicId, date: format(day, 'yyyy-MM-dd') }),
      enabled: view === 'week' && !isPatient,
      staleTime: 30_000,
    })),
  });

  // ── Helpers para obtener entries por fecha ────────────────────────

  const entriesForDate = (date: Date): DayScheduleEntry[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (isPatient) {
      return (patientAppts.data?.items ?? [])
        .filter((a) => a.slot_start.startsWith(dateStr))
        .map((a) => ({
          appointment_id: a.appointment_id,
          slot_start:     a.slot_start,
          slot_end:       a.slot_end,
          patient_name:   a.patient_name,
          procedure_name: a.procedure_name,
          status:         a.status,
        }));
    }
    return [];
  };

  const staffEntriesForWeekDay = (index: number): DayScheduleEntry[] =>
    weekQueries[index]?.data?.entries ?? [];

  const selectedDayEntries: DayScheduleEntry[] = isPatient
    ? entriesForDate(selectedDate)
    : singleDay.data?.entries ?? [];

  const isLoading = isPatient ? patientAppts.isLoading : singleDay.isLoading;

  // ── Render helpers ────────────────────────────────────────────────

  const DayDetail = () => (
    <Paper sx={{ mt: 2 }}>
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
          {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
        </Typography>
      </Box>
      {isLoading ? (
        <Typography sx={{ p: 2 }} color="text.secondary">Cargando...</Typography>
      ) : selectedDayEntries.length === 0 ? (
        <Typography sx={{ p: 2 }} color="text.secondary">No hay turnos para este día</Typography>
      ) : (
        selectedDayEntries.map((e) => <EntryRow key={e.appointment_id} entry={e} onCancel={(entry) => setCancelState({ entry, reason: '' })} onCheckIn={isStaff ? (entry) => checkInMutation.mutate(entry.appointment_id) : undefined} />)
      )}
    </Paper>
  );

  // ── Vista diaria ──────────────────────────────────────────────────
  const DailyView = () => <DayDetail />;

  // ── Vista semanal ─────────────────────────────────────────────────
  const WeeklyView = () => (
    <Paper sx={{ overflow: 'hidden' }}>
      {/* Cabecera de 7 días */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: 1, borderColor: 'divider' }}>
        {weekDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const entries = isPatient ? entriesForDate(day) : staffEntriesForWeekDay(i);
          return (
            <Box
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              sx={{
                p: 1.5,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isSelected ? 'primary.main' : isCurrentDay ? 'primary.50' : 'transparent',
                color: isSelected ? 'primary.contrastText' : 'inherit',
                borderRight: i < 6 ? 1 : 0,
                borderColor: 'divider',
                transition: 'background 0.15s',
                '&:hover': { bgcolor: isSelected ? 'primary.dark' : 'action.hover' },
              }}
            >
              <Typography variant="caption" display="block" sx={{ opacity: 0.7, textTransform: 'uppercase', fontSize: 10 }}>
                {WEEK_HEADER[i]}
              </Typography>
              <Typography variant="h6" fontWeight={isCurrentDay ? 700 : 400} sx={{ lineHeight: 1.2, my: 0.5 }}>
                {format(day, 'd')}
              </Typography>
              {entries.length > 0 && (
                <Chip
                  label={entries.length}
                  size="small"
                  color={isSelected ? 'default' : 'primary'}
                  sx={{ height: 18, fontSize: 10, '& .MuiChip-label': { px: 0.8 } }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Detalle del día seleccionado */}
      <Box sx={{ minHeight: 80 }}>
        {isLoading ? (
          <Typography sx={{ p: 2 }} color="text.secondary">Cargando...</Typography>
        ) : selectedDayEntries.length === 0 ? (
          <Typography sx={{ p: 2 }} color="text.secondary">No hay turnos para este día</Typography>
        ) : (
          selectedDayEntries.map((e) => <EntryRow key={e.appointment_id} entry={e} onCancel={(entry) => setCancelState({ entry, reason: '' })} onCheckIn={isStaff ? (entry) => checkInMutation.mutate(entry.appointment_id) : undefined} />)
        )}
      </Box>
    </Paper>
  );

  // ── Vista mensual ─────────────────────────────────────────────────
  const MonthlyView = () => {
    const weeks: Date[][] = [];
    for (let i = 0; i < monthGridDays.length; i += 7) {
      weeks.push(monthGridDays.slice(i, i + 7));
    }

    return (
      <Paper sx={{ overflow: 'hidden' }}>
        {/* Encabezado días de semana */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          {WEEK_HEADER.map((d) => (
            <Typography key={d} variant="caption" sx={{ p: 1, textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', fontSize: 10, color: 'text.secondary' }}>
              {d}
            </Typography>
          ))}
        </Box>

        {/* Grilla de días */}
        {weeks.map((week, wi) => (
          <Box
            key={wi}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: wi < weeks.length - 1 ? 1 : 0, borderColor: 'divider' }}
          >
            {week.map((day, di) => {
              const isSelected  = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);
              const inMonth     = isSameMonth(day, selectedDate);
              const dayEntries  = isPatient ? entriesForDate(day) : [];

              return (
                <Box
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  sx={{
                    minHeight: 72,
                    p: 1,
                    cursor: 'pointer',
                    borderRight: di < 6 ? 1 : 0,
                    borderColor: 'divider',
                    bgcolor: isSelected ? 'primary.50' : 'transparent',
                    opacity: inMonth ? 1 : 0.35,
                    '&:hover': { bgcolor: isSelected ? 'primary.100' : 'action.hover' },
                  }}
                >
                  {/* Número del día */}
                  <Box
                    sx={{
                      width: 26, height: 26,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '50%',
                      bgcolor: isCurrentDay ? 'primary.main' : 'transparent',
                      color: isCurrentDay ? 'primary.contrastText' : isSelected ? 'primary.main' : 'text.primary',
                      fontWeight: isCurrentDay || isSelected ? 700 : 400,
                      fontSize: 13,
                    }}
                  >
                    {format(day, 'd')}
                  </Box>

                  {/* Puntos de turnos (paciente) o count (staff seleccionado) */}
                  {dayEntries.length > 0 && (
                    <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                      {dayEntries.slice(0, 3).map((e) => (
                        <Box
                          key={e.appointment_id}
                          sx={{
                            width: 6, height: 6, borderRadius: '50%',
                            bgcolor: isSelected ? 'primary.main' : 'primary.light',
                          }}
                        />
                      ))}
                      {dayEntries.length > 3 && (
                        <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary', lineHeight: 1 }}>
                          +{dayEntries.length - 3}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}

        {/* Panel de detalle del día seleccionado */}
        <Divider />
        <Box sx={{ minHeight: 56 }}>
          <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
              {format(selectedDate, "d 'de' MMMM", { locale: es })}
            </Typography>
          </Box>
          {isLoading ? (
            <Typography sx={{ p: 2 }} color="text.secondary">Cargando...</Typography>
          ) : selectedDayEntries.length === 0 ? (
            <Typography sx={{ p: 2 }} color="text.secondary">Sin turnos</Typography>
          ) : (
            selectedDayEntries.map((e) => <EntryRow key={e.appointment_id} entry={e} onCancel={(entry) => setCancelState({ entry, reason: '' })} onCheckIn={isStaff ? (entry) => checkInMutation.mutate(entry.appointment_id) : undefined} />)
          )}
        </Box>
      </Paper>
    );
  };

  // ── Render principal ──────────────────────────────────────────────
  return (
    <Box>
      {/* Barra de título + controles */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight={600}>Calendario de Turnos</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, v) => v && setView(v)}
            size="small"
          >
            {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
              <ToggleButton key={v} value={v} sx={{ px: 2, textTransform: 'none', fontSize: 13 }}>
                {VIEW_LABELS[v]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => navigate('/appointments/new')}
            sx={{ ml: 1 }}
          >
            Nuevo turno
          </Button>
        </Box>
      </Box>

      {/* Navegación de período */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton size="small" onClick={navigatePrev}><ChevronLeftIcon /></IconButton>
        <IconButton size="small" onClick={navigateNext}><ChevronRightIcon /></IconButton>
        <Typography variant="subtitle1" fontWeight={500} sx={{ textTransform: 'capitalize', flex: 1 }}>
          {rangeLabel()}
        </Typography>
        <Button size="small" variant="outlined" onClick={() => setSelectedDate(new Date())}>
          Hoy
        </Button>
      </Box>

      {/* Vista activa */}
      {view === 'day'   && <DailyView />}
      {view === 'week'  && <WeeklyView />}
      {view === 'month' && <MonthlyView />}

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
            <strong>{cancelState ? formatDateTime(cancelState.entry.slot_start) : ''}</strong>?
          </DialogContentText>
          <TextField
            label="Motivo (opcional)"
            fullWidth
            multiline
            rows={2}
            value={cancelState?.reason ?? ''}
            onChange={(e) => setCancelState((s) => s && { ...s, reason: e.target.value })}
            disabled={cancelMutation.isPending}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelState(null)} disabled={cancelMutation.isPending}>
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
