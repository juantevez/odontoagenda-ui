import { apiClient } from './api.client';
import type {
  Patient,
  RegisterPatientCommand,
  PatientSearchParams,
  PatientListResponse,
} from '../types/patient.types';

export const patientApi = {
  register: async (data: RegisterPatientCommand) => {
    const response = await apiClient.getInstance('PATIENT').post('/patients', data);
    return response.data as { patient_id: string };
  },

  search: async (params: PatientSearchParams): Promise<PatientListResponse> => {
    const response = await apiClient.getInstance('PATIENT').get('/patients', { params });
    return response.data;
  },

  getById: async (patientId: string): Promise<Patient> => {
    const response = await apiClient.getInstance('PATIENT').get(`/patients/${patientId}`);
    return response.data;
  },

  getForBooking: async (patientId: string) => {
    const response = await apiClient.getInstance('PATIENT').get(`/patients/${patientId}/for-booking`);
    return response.data;
  },

  addCoverage: async (patientId: string, coverage: Record<string, unknown>) => {
    const response = await apiClient.getInstance('PATIENT').post(
      `/patients/${patientId}/coverage`,
      coverage
    );
    return response.data as { id: string };
  },

  updateContact: async (
    patientId: string,
    data: { phone: string; email?: string; whatsapp?: string; emergency_name?: string; emergency_phone?: string }
  ) => {
    await apiClient.getInstance('PATIENT').put(`/patients/${patientId}/contact`, data);
  },

  addMedicalAlert: async (
    patientId: string,
    alert: { alert_type: string; severity?: string; description: string }
  ) => {
    const response = await apiClient.getInstance('PATIENT').post(
      `/patients/${patientId}/medical-alerts`,
      alert
    );
    return response.data;
  },

  mergePatients: async (targetPatientId: string, sourcePatientId: string): Promise<void> => {
    await apiClient.getInstance('PATIENT').post('/patients/merge', {
      target_patient_id: targetPatientId,
      source_patient_id: sourcePatientId,
    });
  },
};
