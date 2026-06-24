import { apiClient } from './api.client';
import type {
  Appointment,
  TimeSlot,
  AvailabilityQuery,
  BookAppointmentCommand,
  CancelAppointmentCommand,
  DayScheduleEntry,
} from '../types/appointment.types';

export const schedulingApi = {
  getAvailability: async (query: AvailabilityQuery): Promise<{ date: string; slots: TimeSlot[] }> => {
    const response = await apiClient.getInstance('SCHEDULING').get('/scheduling/availability', {
      params: query,
    });
    return response.data;
  },

  getAvailabilityRange: async (params: {
    professional_id?: string;
    clinic_id?: string;
    from: string;
    to: string;
    procedure_code?: string;
  }) => {
    const response = await apiClient.getInstance('SCHEDULING').get(
      '/scheduling/availability/range',
      { params }
    );
    return response.data;
  },

  getDaySchedule: async (params: {
    professional_id?: string;
    clinic_id?: string;
    date?: string;
  }): Promise<{ entries: DayScheduleEntry[] }> => {
    const response = await apiClient.getInstance('SCHEDULING').get('/scheduling/day-schedule', {
      params,
    });
    return response.data;
  },

  getPatientAppointments: async (
    patientId: string,
    onlyActive?: boolean
  ): Promise<{ items: Appointment[] }> => {
    const response = await apiClient.getInstance('SCHEDULING').get(
      `/scheduling/patients/${patientId}/appointments`,
      { params: { only_active: onlyActive } }
    );
    return response.data;
  },

  bookAppointment: async (data: BookAppointmentCommand) => {
    const response = await apiClient.getInstance('SCHEDULING').post('/scheduling/appointments', data);
    return response.data as { appointment_id: string; status: string };
  },

  cancelAppointment: async (
    appointmentId: string,
    data: CancelAppointmentCommand
  ): Promise<void> => {
    await apiClient.getInstance('SCHEDULING').post(
      `/scheduling/appointments/${appointmentId}/cancel`,
      data
    );
  },

  checkIn: async (appointmentId: string): Promise<void> => {
    await apiClient
      .getInstance('SCHEDULING')
      .post(`/scheduling/appointments/${appointmentId}/check-in`);
  },

  completeAppointment: async (appointmentId: string, clinicalNotes?: string): Promise<void> => {
    await apiClient.getInstance('SCHEDULING').post(
      `/scheduling/appointments/${appointmentId}/complete`,
      { clinical_notes: clinicalNotes }
    );
  },

  markNoShow: async (appointmentId: string): Promise<void> => {
    await apiClient
      .getInstance('SCHEDULING')
      .post(`/scheduling/appointments/${appointmentId}/no-show`);
  },

  blockSlot: async (data: {
    professional_id: string;
    clinic_id: string;
    slot_start: string;
    slot_end: string;
    reason: string;
    note?: string;
  }): Promise<void> => {
    await apiClient.getInstance('SCHEDULING').post('/scheduling/block-slot', data);
  },
};
