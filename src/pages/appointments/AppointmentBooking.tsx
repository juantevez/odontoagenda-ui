import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useBookAppointment, useAvailability, useProfessionals } from '../../hooks/useAppointments';
import { usePatientSearch } from '../../hooks/usePatients';
import { extractErrorMessage } from '../../utils/errors';
import type { Professional } from '../../api/professional.api';
import type { Patient } from '../../types/patient.types';

// La única sede disponible en la BD de prueba.
const DEFAULT_CLINIC_ID = 'a1000000-0000-0000-0000-000000000001';
const DEFAULT_CLINIC_NAME = 'Sede Central';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patient_id') ?? '';

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientInputValue, setPatientInputValue] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [slotStart, setSlotStart] = useState('');
  const [slotEnd, setSlotEnd] = useState('');

  // Patient search autocomplete
  const patientSearch = usePatientSearch({
    q: patientInputValue.length >= 2 ? patientInputValue : undefined,
    limit: 10,
  });

  // Load professionals for the default clinic
  const { data: professionals = [], isLoading: loadingProfessionals } = useProfessionals(DEFAULT_CLINIC_ID);

  // Derive available procedures from the selected professional's licenses
  const procedures = selectedProfessional
    ? (selectedProfessional.licenses ?? [])
        .filter((l) => l.is_valid)
        .map((l) => ({ code: l.specialty_code, name: l.specialty_name || l.specialty_code }))
    : [];

  // Load available slots when all dependencies are selected
  const { data: availabilityData, isLoading: loadingSlots } = useAvailability({
    professional_id: selectedProfessional?.id ?? '',
    clinic_id: DEFAULT_CLINIC_ID,
    date: selectedDate,
    procedure_code: selectedProcedure,
  });

  const slots = availabilityData?.slots ?? [];

  const bookAppointment = useBookAppointment();

  // Pre-select patient from URL
  useEffect(() => {
    if (preselectedPatientId && patientSearch.data?.items?.length) {
      const found = patientSearch.data.items.find((p) => p.id === preselectedPatientId);
      if (found) setSelectedPatient(found);
    }
  }, [preselectedPatientId, patientSearch.data]);

  const canBook =
    selectedPatient &&
    selectedProfessional &&
    selectedProcedure &&
    selectedDate &&
    slotStart &&
    slotEnd;

  const handleBook = async () => {
    if (!canBook) return;
    try {
      await bookAppointment.mutateAsync({
        patient_id: selectedPatient!.id,
        booked_by_id: selectedPatient!.id,
        professional_id: selectedProfessional!.id,
        clinic_id: DEFAULT_CLINIC_ID,
        procedure_code: selectedProcedure,
        slot_start: slotStart,
        slot_end: slotEnd,
        coverage_type: 'particular',
      });
      navigate('/appointments');
    } catch {
      // error shown below
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Typography variant="h5" fontWeight={600}>Reservar turno</Typography>
      </Box>

      {bookAppointment.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractErrorMessage(bookAppointment.error, 'Error al reservar el turno')}
        </Alert>
      )}

      <Box sx={{ maxWidth: 700 }}>
        <Grid container spacing={3}>

          {/* Paciente */}
          <Grid item xs={12}>
            <Autocomplete<Patient>
              options={patientSearch.data?.items ?? []}
              getOptionLabel={(p) => `${p.full_name} — ${p.document_number}`}
              filterOptions={(x) => x}
              value={selectedPatient}
              onInputChange={(_, v) => setPatientInputValue(v)}
              onChange={(_, v) => setSelectedPatient(v)}
              loading={patientSearch.isFetching}
              noOptionsText={patientInputValue.length < 2 ? 'Escribí al menos 2 caracteres' : 'Sin resultados'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Paciente *"
                  placeholder="Buscar por nombre o documento"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {patientSearch.isFetching && <CircularProgress size={16} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Profesional */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Profesional *"
              fullWidth
              value={selectedProfessional?.id ?? ''}
              onChange={(e) => {
                const prof = professionals.find((p) => p.id === e.target.value) ?? null;
                setSelectedProfessional(prof);
                setSelectedProcedure('');
                setSlotStart('');
                setSlotEnd('');
              }}
              disabled={loadingProfessionals}
            >
              {loadingProfessionals && <MenuItem value="">Cargando...</MenuItem>}
              {professionals.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Sede (fija) */}
          <Grid item xs={12} sm={6}>
            <TextField label="Sede" fullWidth value={DEFAULT_CLINIC_NAME} disabled />
          </Grid>

          {/* Procedimiento */}
          <Grid item xs={12}>
            <TextField
              select
              label="Procedimiento *"
              fullWidth
              value={selectedProcedure}
              onChange={(e) => {
                setSelectedProcedure(e.target.value);
                setSlotStart('');
                setSlotEnd('');
              }}
              disabled={!selectedProfessional || procedures.length === 0}
              helperText={selectedProfessional && procedures.length === 0 ? 'El profesional no tiene matrículas activas' : ''}
            >
              {procedures.map((p) => (
                <MenuItem key={p.code} value={p.code}>{p.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Fecha */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fecha *"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={selectedDate}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSlotStart('');
                setSlotEnd('');
              }}
              disabled={!selectedProcedure}
            />
          </Grid>

          {/* Turnos disponibles */}
          {selectedDate && selectedProcedure && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Horarios disponibles
                {loadingSlots && <CircularProgress size={14} sx={{ ml: 1 }} />}
              </Typography>
              {!loadingSlots && slots.length === 0 && (
                <Alert severity="info">No hay turnos disponibles para esa fecha.</Alert>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {slots.map((slot) => (
                  <Chip
                    key={slot.start}
                    label={`${formatTime(slot.start)} – ${formatTime(slot.end)}`}
                    onClick={() => {
                      if (!slot.available) return;
                      setSlotStart(slot.start);
                      setSlotEnd(slot.end);
                    }}
                    disabled={!slot.available}
                    color={slotStart === slot.start ? 'primary' : 'default'}
                    variant={slotStart === slot.start ? 'filled' : 'outlined'}
                    clickable={slot.available}
                  />
                ))}
              </Box>
            </Grid>
          )}

          {/* Confirmar */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={!canBook || bookAppointment.isPending}
              onClick={handleBook}
            >
              {bookAppointment.isPending ? 'Reservando...' : 'Confirmar turno'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
