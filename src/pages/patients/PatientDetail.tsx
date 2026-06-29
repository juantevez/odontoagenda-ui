import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AddIcon from '@mui/icons-material/Add';
import Loading from '../../components/common/Loading';
import { usePatient } from '../../hooks/usePatients';
import { usePatientAppointments } from '../../hooks/useAppointments';
import { formatDate } from '../../utils/formatters';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '../../utils/constants';
import { apptCode, procedureLabel } from '../../utils/appointmentCode';
import { COVERAGE_TYPE_LABELS, COVERAGE_TYPES } from '../../types/patient.types';
import type { PatientDetail as PatientDetailType, Coverage } from '../../types/patient.types';
import { patientApi } from '../../api/patient.api';
import { useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '../../hooks/usePermissions';

// ── Emergency contact dialog ──────────────────────────────────────

interface ContactForm {
  phone: string;
  email: string;
  whatsapp: string;
  emergency_name: string;
  emergency_phone: string;
}

function ContactDialog({
  open,
  patientId,
  current,
  onClose,
}: {
  open: boolean;
  patientId: string;
  current: PatientDetailType['contact_info'];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ContactForm>({
    phone: current?.phone ?? '',
    email: current?.email ?? '',
    whatsapp: current?.whatsapp ?? '',
    emergency_name: current?.emergency_name ?? '',
    emergency_phone: current?.emergency_phone ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    if (!form.phone.trim()) {
      setError('El teléfono principal es requerido');
      return;
    }
    setSaving(true);
    try {
      await patientApi.updateContact(patientId, {
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        emergency_name: form.emergency_name.trim() || undefined,
        emergency_phone: form.emergency_phone.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      onClose();
    } catch {
      setError('No se pudo guardar el contacto. Verificá los datos.');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof ContactForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Editar datos de contacto</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Teléfono principal" size="small" fullWidth required value={form.phone} onChange={set('phone')} placeholder="+54911..." />
          <TextField label="Email" size="small" fullWidth type="email" value={form.email} onChange={set('email')} />
          <TextField label="WhatsApp (si difiere del tel.)" size="small" fullWidth value={form.whatsapp} onChange={set('whatsapp')} placeholder="+54911..." />
          <Divider />
          <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>Contacto de emergencia</Typography>
          <TextField label="Nombre" size="small" fullWidth value={form.emergency_name} onChange={set('emergency_name')} />
          <TextField label="Teléfono de emergencia" size="small" fullWidth value={form.emergency_phone} onChange={set('emergency_phone')} placeholder="+54911..." />
          {error && <Typography color="error" variant="caption">{error}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Coverage assignment dialog ────────────────────────────────────

interface CoverageForm {
  type: string;
  provider_name: string;
  plan_code: string;
  membership_number: string;
  valid_from: string;
  valid_until: string;
  co_pay_percent: string;
}

const EMPTY_FORM: CoverageForm = {
  type: 'Privado',
  provider_name: '',
  plan_code: '',
  membership_number: '',
  valid_from: new Date().toISOString().slice(0, 10),
  valid_until: '',
  co_pay_percent: '',
};

function CoverageDialog({
  open,
  patientId,
  existing,
  onClose,
}: {
  open: boolean;
  patientId: string;
  existing?: Coverage;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CoverageForm>(() =>
    existing
      ? {
          type: existing.type,
          provider_name: existing.provider_name,
          plan_code: existing.plan_code,
          membership_number: existing.membership_number,
          valid_from: existing.valid_from,
          valid_until: existing.valid_until ?? '',
          co_pay_percent: existing.co_pay_percent != null ? String(existing.co_pay_percent) : '',
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isPrivado = form.type === 'Privado';

  const handleSave = async () => {
    setError('');
    if (!isPrivado && !form.provider_name.trim()) {
      setError('El nombre del proveedor es requerido');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        coverage_type: form.type,
        provider_name: form.provider_name.trim() || form.type,
        plan_code: form.plan_code.trim(),
        membership_number: form.membership_number.trim(),
        valid_from: form.valid_from,
      };
      if (form.valid_until) payload.valid_until = form.valid_until;
      if (form.co_pay_percent !== '') payload.co_pay_percent = parseInt(form.co_pay_percent, 10);
      await patientApi.addCoverage(patientId, payload);
      await queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      onClose();
    } catch {
      setError('No se pudo guardar la cobertura. Verificá los datos.');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof CoverageForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{existing ? 'Actualizar cobertura' : 'Asignar cobertura'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de cobertura</InputLabel>
            <Select
              label="Tipo de cobertura"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, provider_name: '' }))}
            >
              {COVERAGE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{COVERAGE_TYPE_LABELS[t]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {!isPrivado && (
            <TextField
              label="Nombre del proveedor"
              size="small"
              fullWidth
              required
              placeholder="ej: OSDE, Swiss Medical, PAMI"
              value={form.provider_name}
              onChange={set('provider_name')}
            />
          )}

          <TextField
            label="Plan / código de plan"
            size="small"
            fullWidth
            placeholder="ej: OSDE 310, Plan Oro"
            value={form.plan_code}
            onChange={set('plan_code')}
          />

          <TextField
            label="Nº de afiliado / credencial"
            size="small"
            fullWidth
            value={form.membership_number}
            onChange={set('membership_number')}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Vigente desde"
                type="date"
                size="small"
                fullWidth
                required
                value={form.valid_from}
                onChange={set('valid_from')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Vence (opcional)"
                type="date"
                size="small"
                fullWidth
                value={form.valid_until}
                onChange={set('valid_until')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <TextField
            label="Copago (%)"
            type="number"
            size="small"
            fullWidth
            placeholder="ej: 20 (dejar vacío si no aplica)"
            value={form.co_pay_percent}
            onChange={set('co_pay_percent')}
            InputProps={{
              inputProps: { min: 0, max: 100 },
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />

          {error && (
            <Typography color="error" variant="caption">{error}</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Coverage card ─────────────────────────────────────────────────

function CoverageCard({
  coverage,
  onEdit,
  canEdit,
}: {
  coverage?: Coverage;
  onEdit: () => void;
  canEdit: boolean;
}) {
  if (!coverage) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography color="text.secondary" variant="body2">Sin cobertura asignada</Typography>
        {canEdit && (
          <Button size="small" startIcon={<AddIcon />} onClick={onEdit}>
            Asignar
          </Button>
        )}
      </Box>
    );
  }

  const coPayLabel = coverage.co_pay_percent != null
    ? `${coverage.co_pay_percent}% copago`
    : coverage.co_pay_fixed_cents != null
      ? `$${(coverage.co_pay_fixed_cents / 100).toFixed(0)} copago fijo`
      : null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HealthAndSafetyIcon color="primary" />
          <Box>
            <Typography fontWeight={600}>
              {coverage.provider_name || COVERAGE_TYPE_LABELS[coverage.type] || coverage.type}
            </Typography>
            {coverage.plan_code && (
              <Typography variant="caption" color="text.secondary">{coverage.plan_code}</Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={COVERAGE_TYPE_LABELS[coverage.type] ?? coverage.type}
            size="small"
            color="primary"
            variant="outlined"
          />
          {canEdit && (
            <Tooltip title="Actualizar cobertura">
              <IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Grid container spacing={1}>
        {coverage.membership_number && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography color="text.secondary" sx={{ minWidth: 140 }} variant="body2">Nº afiliado:</Typography>
              <Typography variant="body2" fontWeight={500}>{coverage.membership_number}</Typography>
            </Box>
          </Grid>
        )}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography color="text.secondary" sx={{ minWidth: 140 }} variant="body2">Vigente desde:</Typography>
            <Typography variant="body2">{formatDate(coverage.valid_from)}</Typography>
          </Box>
        </Grid>
        {coverage.valid_until && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography color="text.secondary" sx={{ minWidth: 140 }} variant="body2">Vence:</Typography>
              <Typography variant="body2">{formatDate(coverage.valid_until)}</Typography>
            </Box>
          </Grid>
        )}
        {coPayLabel && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography color="text.secondary" sx={{ minWidth: 140 }} variant="body2">Copago:</Typography>
              <Typography variant="body2">{coPayLabel}</Typography>
            </Box>
          </Grid>
        )}
        {coverage.requires_external_authorization && (
          <Grid item xs={12}>
            <Chip label="Requiere autorización previa" size="small" color="warning" variant="outlined" />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStaff } = usePermissions();
  const { data: patient, isLoading } = usePatient(id ?? '');
  const { data: apptData, isLoading: apptLoading } = usePatientAppointments(id ?? '');
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  if (isLoading) return <Loading />;
  if (!patient) return <Typography>Paciente no encontrado</Typography>;

  const p = patient as unknown as PatientDetailType;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Typography variant="h5" fontWeight={600}>{p.full_name}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Datos personales</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={1}>
              {[
                ['Documento', `${p.national_id?.type ?? '—'} ${p.national_id?.number ?? '—'}`],
                ['Fecha nacimiento', formatDate(p.birth_date)],
                ['Edad', `${p.age_years} años${p.is_minor ? ' (menor)' : ''}`],
                ['Género', p.gender],
                ['Teléfono', p.contact_info?.phone ?? '—'],
                ['Email', p.contact_info?.email ?? '—'],
              ].map(([label, value]) => (
                <Grid item xs={12} key={label}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography color="text.secondary" sx={{ minWidth: 140 }}>{label}:</Typography>
                    <Typography>{value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Plan de salud</Typography>
            <Divider sx={{ mb: 2 }} />
            <CoverageCard
              coverage={p.active_coverage}
              onEdit={() => setCoverageOpen(true)}
              canEdit={isStaff}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Contacto de emergencia</Typography>
              {isStaff && (
                <Tooltip title="Editar contacto">
                  <IconButton size="small" onClick={() => setContactOpen(true)}><EditIcon fontSize="small" /></IconButton>
                </Tooltip>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography color="text.secondary" sx={{ minWidth: 140 }}>Nombre:</Typography>
              <Typography>{p.contact_info?.emergency_name || '—'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography color="text.secondary" sx={{ minWidth: 140 }}>Teléfono:</Typography>
              <Typography>{p.contact_info?.emergency_phone || '—'}</Typography>
            </Box>
          </Paper>
        </Grid>

        {p.active_alerts?.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderLeft: '4px solid', borderColor: 'warning.main' }}>
              <Typography variant="h6" gutterBottom color="warning.main">Alertas médicas</Typography>
              <Divider sx={{ mb: 2 }} />
              {p.active_alerts.map((alert) => (
                <Box key={alert.alert_id} sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{alert.alert_type} — {alert.severity}</Typography>
                  <Typography variant="body2" color="text.secondary">{alert.description}</Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Turnos</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CalendarMonthIcon />}
                onClick={() => navigate(`/book?patient_id=${p.id}`)}
              >
                Nuevo turno
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {apptLoading ? (
              <Typography color="text.secondary">Cargando turnos...</Typography>
            ) : (apptData?.items ?? []).length === 0 ? (
              <Typography color="text.secondary">Sin turnos registrados</Typography>
            ) : (
              (apptData?.items ?? []).map((a) => (
                <Box
                  key={a.appointment_id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ fontFamily: 'monospace', letterSpacing: 1, color: 'primary.main' }}
                    >
                      {apptCode(a.appointment_id, a.slot_start, a.procedure_code)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      {a.slot_start.slice(0, 10).split('-').reverse().join('/')}&nbsp;
                      {a.slot_start.slice(11, 16)} hs
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {procedureLabel(a.procedure_code)}
                    </Typography>
                  </Box>
                  <Chip
                    label={APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
                    color={APPOINTMENT_STATUS_COLORS[a.status] ?? 'default'}
                    size="small"
                  />
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>

      {coverageOpen && (
        <CoverageDialog
          open={coverageOpen}
          patientId={p.id}
          existing={p.active_coverage}
          onClose={() => setCoverageOpen(false)}
        />
      )}

      {contactOpen && (
        <ContactDialog
          open={contactOpen}
          patientId={p.id}
          current={p.contact_info}
          onClose={() => setContactOpen(false)}
        />
      )}
    </Box>
  );
}
