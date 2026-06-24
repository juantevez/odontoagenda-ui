import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppointmentFormComponent from '../../components/forms/AppointmentForm';
import { useBookAppointment, useAvailability } from '../../hooks/useAppointments';
import type { AppointmentFormData } from '../../utils/validators';

const STEPS = ['Seleccionar profesional', 'Elegir horario', 'Confirmar'];

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient_id') ?? '';
  const [activeStep] = useState(0);
  const [selectedProfessional] = useState('');
  const [selectedClinic] = useState('');
  const [selectedDate] = useState('');

  const { data: availabilityData } = useAvailability({
    professional_id: selectedProfessional,
    clinic_id: selectedClinic,
    date: selectedDate,
  });

  const bookAppointment = useBookAppointment();

  const handleSubmit = async (data: AppointmentFormData) => {
    await bookAppointment.mutateAsync(data);
    navigate('/appointments');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Typography variant="h5" fontWeight={600}>Reservar turno</Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {bookAppointment.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {bookAppointment.error?.message ?? 'Error al reservar el turno'}
        </Alert>
      )}

      <Box sx={{ maxWidth: 700 }}>
        <AppointmentFormComponent
          patientId={patientId}
          professionals={[]}
          clinics={[]}
          procedures={[]}
          slots={availabilityData?.slots ?? []}
          onSubmit={handleSubmit}
          isLoading={bookAppointment.isPending}
          error={bookAppointment.error?.message}
        />
      </Box>
    </Box>
  );
}
