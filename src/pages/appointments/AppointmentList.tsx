import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import Table, { type Column } from '../../components/common/Table';
import { usePatientAppointments } from '../../hooks/useAppointments';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDateTime } from '../../utils/formatters';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '../../utils/constants';
import type { Appointment } from '../../types/appointment.types';

export default function AppointmentList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const { isPatient } = usePermissions();

  // Si hay patient_id en la URL, usarlo (ej: desde perfil del paciente).
  // Si el usuario es paciente, mostrar sus propios turnos.
  const urlPatientId = searchParams.get('patient_id') ?? '';
  const patientId = urlPatientId || (isPatient ? (user?.patient_id ?? '') : '');

  const { data, isLoading } = usePatientAppointments(patientId);

  const columns: Column<Appointment>[] = [
    { key: 'patient_name', label: 'Paciente' },
    { key: 'professional_name', label: 'Profesional' },
    { key: 'procedure_name', label: 'Procedimiento' },
    {
      key: 'slot_start',
      label: 'Fecha y hora',
      render: (a) => formatDateTime(a.slot_start),
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
    </Box>
  );
}
