import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '../api/patient.api';
import type { RegisterPatientCommand, PatientSearchParams } from '../types/patient.types';

export function usePatientSearch(params: PatientSearchParams) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientApi.search(params),
    enabled: Boolean(params.q) || params.limit !== undefined,
  });
}

export function usePatient(patientId: string) {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientApi.getById(patientId),
    enabled: Boolean(patientId) && patientId !== 'undefined',
  });
}

export function useRegisterPatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterPatientCommand) => patientApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
