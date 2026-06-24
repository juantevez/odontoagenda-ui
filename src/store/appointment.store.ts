import { create } from 'zustand';
import { schedulingApi } from '../api/scheduling.api';
import type { Appointment, TimeSlot, AvailabilityQuery } from '../types/appointment.types';

interface AppointmentState {
  appointments: Appointment[];
  slots: TimeSlot[];
  isLoading: boolean;
  error: string | null;

  loadPatientAppointments: (patientId: string, onlyActive?: boolean) => Promise<void>;
  loadAvailability: (query: AvailabilityQuery) => Promise<void>;
  clearSlots: () => void;
  clearError: () => void;
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  slots: [],
  isLoading: false,
  error: null,

  loadPatientAppointments: async (patientId, onlyActive) => {
    set({ isLoading: true, error: null });
    try {
      const result = await schedulingApi.getPatientAppointments(patientId, onlyActive);
      set({ appointments: result.items, isLoading: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al cargar turnos';
      set({ error: msg, isLoading: false });
    }
  },

  loadAvailability: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const result = await schedulingApi.getAvailability(query);
      set({ slots: result.slots, isLoading: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al cargar disponibilidad';
      set({ error: msg, isLoading: false });
    }
  },

  clearSlots: () => set({ slots: [] }),
  clearError: () => set({ error: null }),
}));
