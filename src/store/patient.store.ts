import { create } from 'zustand';
import { patientApi } from '../api/patient.api';
import type { Patient, PatientSearchParams } from '../types/patient.types';

interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  total: number;
  isLoading: boolean;
  error: string | null;

  searchPatients: (params: PatientSearchParams) => Promise<void>;
  selectPatient: (patient: Patient | null) => void;
  loadPatient: (patientId: string) => Promise<void>;
  clearError: () => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  selectedPatient: null,
  total: 0,
  isLoading: false,
  error: null,

  searchPatients: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const result = await patientApi.search(params);
      set({ patients: result.items, total: result.total, isLoading: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al buscar pacientes';
      set({ error: msg, isLoading: false });
    }
  },

  selectPatient: (patient) => set({ selectedPatient: patient }),

  loadPatient: async (patientId) => {
    set({ isLoading: true, error: null });
    try {
      const patient = await patientApi.getById(patientId);
      set({ selectedPatient: patient, isLoading: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al cargar paciente';
      set({ error: msg, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
