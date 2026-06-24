import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PatientFormComponent from '../../components/forms/PatientForm';
import Modal from '../../components/common/Modal';
import { useRegisterPatient } from '../../hooks/usePatients';
import { patientApi } from '../../api/patient.api';
import type { PatientFormData } from '../../utils/validators';
import type { DuplicateCandidate } from '../../types/patient.types';
import { extractErrorMessage } from '../../utils/errors';

export default function PatientFormPage() {
  const navigate = useNavigate();
  const registerPatient = useRegisterPatient();
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [pendingData, setPendingData] = useState<PatientFormData | null>(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);

  const handleSubmit = async (data: PatientFormData) => {
    try {
      const result = await registerPatient.mutateAsync(data);
      navigate(`/patients/${result.patient_id}`);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as { response?: { data?: { code?: string; candidates?: DuplicateCandidate[] } } }).response?.data?.code === 'DUPLICATE_WARNING'
      ) {
        const candidates = (error as { response: { data: { candidates: DuplicateCandidate[] } } }).response.data.candidates;
        setDuplicates(candidates);
        setPendingData(data);
        setDuplicateModalOpen(true);
      }
    }
  };

  const handleConfirmDuplicate = async () => {
    if (!pendingData) return;
    const result = await patientApi.register({ ...pendingData, skip_duplicate_check: true });
    setDuplicateModalOpen(false);
    navigate(`/patients/${result.patient_id}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Typography variant="h5" fontWeight={600}>Nuevo paciente</Typography>
      </Box>

      <Box sx={{ maxWidth: 700 }}>
        <PatientFormComponent
          onSubmit={handleSubmit}
          isLoading={registerPatient.isPending}
          error={registerPatient.error ? extractErrorMessage(registerPatient.error, 'Error al guardar paciente') : null}
        />
      </Box>

      <Modal
        open={duplicateModalOpen}
        title="Posibles duplicados encontrados"
        onClose={() => setDuplicateModalOpen(false)}
        onConfirm={handleConfirmDuplicate}
        confirmLabel="Crear de todas formas"
        confirmColor="warning"
      >
        <Alert severity="warning" sx={{ mb: 2 }}>
          Se encontraron pacientes similares. ¿Desea crear el paciente de todas formas?
        </Alert>
        {duplicates.map((d) => (
          <Box key={d.patient_id} sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600}>{d.full_name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Similitud: {Math.round(d.score * 100)}% — coincide en: {d.matched_on.join(', ')}
            </Typography>
          </Box>
        ))}
      </Modal>
    </Box>
  );
}
