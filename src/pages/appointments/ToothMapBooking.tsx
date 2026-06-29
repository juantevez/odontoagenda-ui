import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format, addDays, parseISO, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSearchParams } from 'react-router-dom';
import { schedulingApi } from '../../api/scheduling.api';
import { professionalApi } from '../../api/professional.api';
import { patientApi } from '../../api/patient.api';
import type { Patient } from '../../types/patient.types';
import { useBookAppointment } from '../../hooks/useAppointments';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';
import { SPECIALTY_LABELS } from '../../utils/constants';
import ToothIcon, { BLOCK_COLORS, type TimeBlock } from '../../components/tooth-map/ToothIcon';
import BookingTicket, { type TicketData } from './BookingTicket';

const DEFAULT_CLINIC_ID = 'a1000000-0000-0000-0000-000000000001';
const HOLD_MINUTES = 10;

// ── Helpers ───────────────────────────────────────────────────────

function getTimeBlock(timeStr: string): TimeBlock {
  const hour = parseInt(timeStr.slice(0, 2), 10);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

const BLOCK_LABELS: Record<TimeBlock, string> = {
  morning:   'Mañana',
  afternoon: 'Tarde',
  evening:   'Tarde-Noche',
};

// ── Legend ────────────────────────────────────────────────────────

function MapLegend() {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      {(Object.entries(BLOCK_LABELS) as [TimeBlock, string][]).map(([block, label]) => (
        <Box key={block} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: BLOCK_COLORS[block] }} />
          <Typography variant="caption">{label}</Typography>
        </Box>
      ))}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#CBD5E1', opacity: 0.7 }} />
        <Typography variant="caption">Ocupado</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#1976d2' }} />
        <Typography variant="caption">Seleccionado</Typography>
      </Box>
    </Box>
  );
}

// ── Countdown Timer ───────────────────────────────────────────────

function Countdown({ expiresAt, onExpire }: { expiresAt: Date; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, expiresAt.getTime() - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, expiresAt.getTime() - Date.now());
      setRemaining(left);
      if (left === 0) onExpire();
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const total = HOLD_MINUTES * 60 * 1000;
  const pct   = (remaining / total) * 100;
  const mm    = String(Math.floor(remaining / 60000)).padStart(2, '0');
  const ss    = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">Tiempo para confirmar</Typography>
        <Typography variant="caption" fontWeight={700} color={pct < 25 ? 'error.main' : 'text.primary'}>
          {mm}:{ss}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={pct < 25 ? 'error' : 'primary'}
        sx={{ borderRadius: 1 }}
      />
    </Box>
  );
}

// ── Booking Confirmation Dialog ───────────────────────────────────

interface SelectedSlot {
  professionalId:   string;
  professionalName: string;
  slotStart:        string;
  slotEnd:          string;
}

function ConfirmDialog({
  open,
  slot,
  clinicId,
  preselectedPatientId,
  onClose,
  onBooked,
  onAvailabilityInvalidate,
}: {
  open:     boolean;
  slot:     SelectedSlot | null;
  clinicId: string;
  preselectedPatientId?: string;
  onClose:  () => void;
  onBooked: (ticket: TicketData) => void;
  onAvailabilityInvalidate: () => void;
}) {
  const { isProfessional, isStaff } = usePermissions();
  const user                        = useAuthStore((s) => s.user);

  const book = useBookAppointment();
  const [procedure,  setProcedure]  = useState('ODONTOLOGIA_GENERAL');

  // Staff selects a patient via autocomplete; patients use their own ID.
  const selfPatientId = user?.patient_id ?? '';
  const [patientId,       setPatientId]       = useState(preselectedPatientId ?? selfPatientId);
  const [patientSearch,   setPatientSearch]   = useState('');
  const [patientOptions,  setPatientOptions]  = useState<Patient[]>([]);
  const [patientLoading,  setPatientLoading]  = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Pre-cargar paciente si viene desde PatientDetail.
  useEffect(() => {
    if (!isStaff || !preselectedPatientId) return;
    patientApi.getById(preselectedPatientId).then((p) => {
      // getById devuelve PatientDetail; mapeamos al shape mínimo de Patient.
      const asPatient: Patient = {
        id: p.id,
        full_name: p.full_name,
        birth_date: p.birth_date,
        document_type: p.document_type,
        document_number: p.document_number,
        phone: p.phone,
      };
      setSelectedPatient(asPatient);
      setPatientId(p.id);
      setPatientSearch(p.full_name);
      setPatientOptions([asPatient]);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedPatientId, isStaff]);

  // Debounced patient search for staff roles.
  useEffect(() => {
    if (!isStaff) return;
    if (patientSearch.length < 2) { setPatientOptions([]); return; }
    const timer = setTimeout(async () => {
      setPatientLoading(true);
      try {
        const res = await patientApi.search({ q: patientSearch, limit: 8 });
        setPatientOptions(res.items);
      } catch { setPatientOptions([]); }
      finally { setPatientLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch, isStaff]);
  const [holdId,     setHoldId]     = useState<string | null>(null);
  const [expiresAt,  setExpiresAt]  = useState<Date>(() => new Date(Date.now() + HOLD_MINUTES * 60_000));
  const [holdError,  setHoldError]  = useState<string | null>(null);
  const [expired,    setExpired]    = useState(false);
  const holdIdRef = useRef<string | null>(null);

  // Adquirir hold en el servidor al abrir el dialog.
  useEffect(() => {
    if (!open || !slot) return;
    setExpired(false);
    setHoldError(null);
    setHoldId(null);
    holdIdRef.current = null;

    schedulingApi.holdSlot({
      professional_id: slot.professionalId,
      clinic_id:       clinicId,
      slot_start:      slot.slotStart,
      slot_end:        slot.slotEnd,
    }).then((res) => {
      setHoldId(res.hold_id);
      holdIdRef.current = res.hold_id;
      setExpiresAt(new Date(res.expires_at));
      onAvailabilityInvalidate();
    }).catch(() => {
      setHoldError('Este horario acaba de ser tomado por otra persona. Por favor, elegí otro.');
    });

    // Liberar hold al desmontar / cerrar.
    return () => {
      if (holdIdRef.current) {
        schedulingApi.releaseHold(holdIdRef.current).catch(() => {});
        holdIdRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slot?.slotStart, slot?.professionalId]);

  if (!slot) return null;

  // slice(0,16) descarta el sufijo 'Z' para que parseISO trate el horario como
  // hora local de la clínica (el backend guarda naive timestamps con 'Z').
  const slotDate  = parseISO(slot.slotStart.slice(0, 16));
  const dateLabel = format(slotDate, "EEEE d 'de' MMMM", { locale: es });
  const time      = format(slotDate, 'HH:mm');

  const handleClose = () => {
    if (holdIdRef.current) {
      schedulingApi.releaseHold(holdIdRef.current).catch(() => {});
      holdIdRef.current = null;
      setHoldId(null);
      onAvailabilityInvalidate();
    }
    onClose();
  };

  const handleBook = async () => {
    if (expired || !holdId) return;
    const result = await book.mutateAsync({
      patient_id:      patientId,
      booked_by_id:    user?.user_id,
      professional_id: slot.professionalId,
      clinic_id:       clinicId,
      procedure_code:  procedure,
      slot_start:      slot.slotStart,
      slot_end:        slot.slotEnd,
    });
    holdIdRef.current = null; // el hold queda obsoleto, el cleanup lo eliminará
    onBooked({
      appointmentId:    result.appointment_id,
      patientName:      selectedPatient?.full_name ?? 'Paciente',
      professionalName: slot.professionalName,
      procedureCode:    procedure,
      slotStart:        slot.slotStart,
      slotEnd:          slot.slotEnd,
    });
  };

  const isHolding  = open && !holdId && !holdError;
  const patientReady = isStaff ? !!selectedPatient : !!selfPatientId || isProfessional;
  const canConfirm   = !!holdId && !expired && !book.isPending && patientReady;

  return (
    <Dialog open={open} onClose={() => !book.isPending && handleClose()} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar turno</DialogTitle>
      <DialogContent>
        {holdError ? (
          <Alert severity="error" sx={{ mb: 2 }}>{holdError}</Alert>
        ) : isHolding ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Reservando tu lugar...</Typography>
            <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
          </Box>
        ) : expired ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            El tiempo expiró. El turno fue liberado. Por favor, elegí otro.
          </Alert>
        ) : (
          <Countdown expiresAt={expiresAt} onExpire={() => { setExpired(true); onAvailabilityInvalidate(); }} />
        )}

        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'primary.50' }}>
          <Typography variant="body2" color="text.secondary">Profesional</Typography>
          <Typography fontWeight={600}>{slot.professionalName}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Fecha y hora</Typography>
          <Typography fontWeight={600} sx={{ textTransform: 'capitalize' }}>
            {dateLabel} — {time} hs
          </Typography>
        </Paper>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Especialidad / Procedimiento</InputLabel>
          <Select
            label="Especialidad / Procedimiento"
            value={procedure}
            onChange={(e) => setProcedure(e.target.value)}
            disabled={!canConfirm}
          >
            {Object.entries(SPECIALTY_LABELS).map(([code, label]) => (
              <MenuItem key={code} value={code}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {isStaff ? (
          /* Staff: buscar paciente por nombre o DNI */
          <Autocomplete
            size="small"
            options={patientOptions}
            getOptionLabel={(p) => `${p.full_name}`}
            filterOptions={(x) => x}
            loading={patientLoading}
            inputValue={patientSearch}
            value={selectedPatient}
            disabled={!holdId || expired}
            onChange={(_, p) => {
              setSelectedPatient(p);
              setPatientId(p?.id ?? '');
            }}
            onInputChange={(_, v) => setPatientSearch(v)}
            renderOption={(props, p) => (
              <li {...props} key={p.id}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{p.full_name}</Typography>
                  {p.document_number && (
                    <Typography variant="caption" color="text.secondary">
                      {p.document_type} {p.document_number}
                    </Typography>
                  )}
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar paciente"
                placeholder="Nombre o DNI..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {patientLoading && <CircularProgress size={16} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        ) : !isProfessional && selfPatientId ? (
          /* Paciente: su propio ID, solo informativo */
          <Paper variant="outlined" sx={{ px: 2, py: 1, bgcolor: 'success.50' }}>
            <Typography variant="caption" color="text.secondary">Paciente</Typography>
            <Typography variant="body2" fontWeight={600}>{user?.user_id?.slice(0, 8)}…</Typography>
          </Paper>
        ) : null}

        {book.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            No se pudo confirmar el turno. El horario puede haber sido tomado por otra persona.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={book.isPending}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleBook}
          disabled={!canConfirm}
        >
          {book.isPending ? 'Confirmando...' : '¡Confirmar turno!'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function ToothMapBooking() {
  const user        = useAuthStore((s) => s.user);
  const clinicId    = user?.clinic_ids?.[0] ?? DEFAULT_CLINIC_ID;
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patient_id') ?? undefined;

  const [date,       setDate]       = useState(() => addDays(new Date(), 1));
  const [blockFilter, setBlockFilter] = useState<TimeBlock | 'all'>('all');
  const [selected,   setSelected]   = useState<SelectedSlot | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ticket,     setTicket]     = useState<TicketData | null>(null);

  const blockRefs = useRef<Partial<Record<TimeBlock, HTMLElement | null>>>({});

  const dateStr = format(date, 'yyyy-MM-dd');
  const isPast  = isBefore(startOfDay(date), startOfDay(new Date()));

  // Load all professionals
  const { data: professionals = [] } = useQueries({
    queries: [{
      queryKey: ['professionals', clinicId],
      queryFn: () => professionalApi.listByClinic({ clinic_id: clinicId }),
      staleTime: 60_000,
    }],
    combine: (results) => ({ data: results[0]?.data ?? [] }),
  });

  // Load availability for each professional in parallel
  const availabilityQueries = useQueries({
    queries: professionals.map((prof) => ({
      queryKey: ['availability', { professional_id: prof.id, clinic_id: clinicId, date: dateStr }],
      queryFn: () => schedulingApi.getAvailability({ professional_id: prof.id, clinic_id: clinicId, date: dateStr }),
      enabled: Boolean(dateStr && prof.id),
      staleTime: 30_000,
    })),
  });

  const isLoading = availabilityQueries.some((q) => q.isLoading);

  // Invalida las queries de disponibilidad para reflejar hold/release.
  const invalidateAvailability = useCallback(() => {
    professionals.forEach((prof) => {
      queryClient.invalidateQueries({
        queryKey: ['availability', { professional_id: prof.id, clinic_id: clinicId, date: dateStr }],
      });
    });
  }, [queryClient, clinicId, dateStr, professionals]);

  // Build matrix
  const { rows, hasAnySlot } = useMemo(() => {
    // Collect all unique times from available slots across professionals
    const timeSet = new Set<string>();
    availabilityQueries.forEach((q) => {
      (q.data?.slots ?? []).forEach((s) => {
        timeSet.add(s.start.slice(11, 16)); // "HH:MM"
      });
    });

    const sortedTimes = Array.from(timeSet).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

    const rows = sortedTimes.map((time) => {
      const block = getTimeBlock(time);
      const cells = professionals.map((prof, idx) => {
        const slots  = availabilityQueries[idx]?.data?.slots ?? [];
        const slot   = slots.find((s) => s.start.slice(11, 16) === time);
        return {
          professionalId:   prof.id,
          professionalName: prof.full_name,
          slotStart:        slot?.start ?? '',
          slotEnd:          slot?.end ?? '',
          available:        !!slot,
        };
      });
      return { time, block, cells };
    });

    return { rows, hasAnySlot: rows.length > 0 };
  }, [availabilityQueries, professionals]);

  // Filtered rows by time block
  const visibleRows = blockFilter === 'all'
    ? rows
    : rows.filter((r) => r.block === blockFilter);

  // Scroll to block section
  const scrollToBlock = (block: TimeBlock) => {
    setBlockFilter('all');
    setTimeout(() => {
      blockRefs.current[block]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleToothClick = (cell: SelectedSlot) => {
    setSelected(cell);
    setConfirmOpen(true);
  };

  const handleBooked = (t: TicketData) => {
    setConfirmOpen(false);
    setSelected(null);
    setTicket({
      ...t,
      returnPath: preselectedPatientId ? `/patients/${preselectedPatientId}` : undefined,
    });
  };

  // ── Ticket screen ───────────────────────────────────────────────
  if (ticket) {
    return <BookingTicket ticket={ticket} onClose={() => setTicket(null)} />;
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 1, sm: 2 }, py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>🦷 Reservá tu turno</Typography>
        <Typography variant="body2" color="text.secondary">
          Elegí el día y seleccioná el horario que mejor te quede
        </Typography>
      </Box>

      {/* Date navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <IconButton onClick={() => setDate((d) => addDays(d, -1))} disabled={isPast}>
          <ChevronLeftIcon />
        </IconButton>
        <Paper
          variant="outlined"
          sx={{ px: 3, py: 1, textAlign: 'center', minWidth: 200 }}
        >
          <Typography fontWeight={600} sx={{ textTransform: 'capitalize' }}>
            {format(date, "EEEE d 'de' MMMM", { locale: es })}
          </Typography>
          <Typography variant="caption" color="text.secondary">{dateStr}</Typography>
        </Paper>
        <IconButton onClick={() => setDate((d) => addDays(d, 1))}>
          <ChevronRightIcon />
        </IconButton>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: { sm: 2 } }}>
          {(['morning', 'afternoon', 'evening'] as TimeBlock[]).map((b) => (
            <Chip
              key={b}
              label={BLOCK_LABELS[b]}
              clickable
              onClick={() => {
                if (blockFilter === b) {
                  setBlockFilter('all');
                } else {
                  setBlockFilter(b);
                  scrollToBlock(b);
                }
              }}
              sx={{
                borderColor: BLOCK_COLORS[b],
                color: blockFilter === b ? 'white' : BLOCK_COLORS[b],
                bgcolor: blockFilter === b ? BLOCK_COLORS[b] : 'transparent',
                border: '2px solid',
                fontWeight: 600,
              }}
            />
          ))}
          {blockFilter !== 'all' && (
            <Chip label="Todos" clickable onClick={() => setBlockFilter('all')} variant="outlined" />
          )}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ mb: 2 }}>
        <MapLegend />
      </Box>

      {/* Matrix */}
      <Paper variant="outlined" sx={{ overflow: 'auto' }}>
        {/* Column headers — professional names */}
        {professionals.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `80px repeat(${professionals.length}, minmax(60px, 1fr))`,
              borderBottom: 1,
              borderColor: 'divider',
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              zIndex: 1,
            }}
          >
            <Box sx={{ p: 1 }} />
            {professionals.map((prof) => (
              <Box key={prof.id} sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="caption" fontWeight={600} lineHeight={1.2} noWrap>
                  {prof.full_name.split(' ').slice(0, 2).join(' ')}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Rows */}
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height={56} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : !hasAnySlot || isPast ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography fontSize={48}>🦷</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {isPast ? 'No se pueden ver turnos de fechas pasadas' : 'Sin disponibilidad para este día'}
            </Typography>
            <Button sx={{ mt: 2 }} onClick={() => setDate((d) => addDays(d, 1))}>
              Ver día siguiente
            </Button>
          </Box>
        ) : (
          (() => {
            let lastBlock: TimeBlock | null = null;
            return visibleRows.map((row) => {
              const isNewBlock = row.block !== lastBlock;
              lastBlock = row.block;
              const blockColor = BLOCK_COLORS[row.block];

              return (
                <Box key={row.time}>
                  {/* Block separator */}
                  {isNewBlock && (
                    <Box
                      ref={(el) => { blockRefs.current[row.block] = el as HTMLElement | null; }}
                      sx={{
                        px: 2,
                        py: 0.75,
                        bgcolor: blockColor + '18',
                        borderLeft: `4px solid ${blockColor}`,
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="caption" fontWeight={700} sx={{ color: blockColor }}>
                        {BLOCK_LABELS[row.block].toUpperCase()}
                      </Typography>
                    </Box>
                  )}

                  {/* Row */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: `80px repeat(${professionals.length}, minmax(60px, 1fr))`,
                      borderBottom: 1,
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    {/* Time label */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" fontFamily="monospace">
                        {row.time}
                      </Typography>
                    </Box>

                    {/* Tooth cells */}
                    {row.cells.map((cell) => {
                      const isSelected =
                        selected?.professionalId === cell.professionalId &&
                        selected?.slotStart === cell.slotStart;

                      const tooltipText = cell.available
                        ? `${format(date, "EEEE d", { locale: es })} ${row.time} hs — ${cell.professionalName}`
                        : 'No disponible';

                      return (
                        <Box
                          key={cell.professionalId}
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0.5 }}
                        >
                          <ToothIcon
                            state={isSelected ? 'selected' : cell.available ? 'available' : 'occupied'}
                            block={row.block}
                            tooltip={tooltipText}
                            onClick={cell.available ? () => handleToothClick(cell) : undefined}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            });
          })()
        )}
      </Paper>

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={confirmOpen}
        slot={selected}
        clinicId={clinicId}
        preselectedPatientId={preselectedPatientId}
        onClose={() => { setConfirmOpen(false); setSelected(null); }}
        onBooked={handleBooked}
        onAvailabilityInvalidate={invalidateAvailability}
      />
    </Box>
  );
}
