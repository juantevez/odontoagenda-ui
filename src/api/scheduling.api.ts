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
    // Backend returns { free_slots: [{ slot_start, slot_end, ... }] }
    // Map to the TimeSlot shape the UI expects: { start, end, available }
    const raw = response.data as { date?: string; free_slots?: { slot_start: string; slot_end: string }[] };
    return {
      date: raw.date ?? query.date,
      slots: (raw.free_slots ?? []).map((s) => ({
        start: s.slot_start,
        end: s.slot_end,
        available: true,
      })),
    };
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
  }): Promise<{ entries: DayScheduleEntry[]; total_booked: number; completed_count: number }> => {
    const response = await apiClient.getInstance('SCHEDULING').get('/scheduling/day-schedule', {
      params,
    });
    // Backend returns { appointments: AppointmentDTO[], free_slots: [], total_booked, total_free }
    const raw = response.data as {
      appointments?: Array<{
        id: string;
        slot_start: string;
        slot_end: string;
        patient_id: string;
        procedure_code: string;
        status: string;
      }>;
      total_booked?: number;
    };
    const appointments = raw.appointments ?? [];
    return {
      entries: appointments.map((a) => ({
        appointment_id: a.id,
        slot_start: a.slot_start,
        slot_end: a.slot_end,
        patient_name: a.patient_id,
        procedure_name: a.procedure_code,
        status: a.status as DayScheduleEntry['status'],
      })),
      total_booked: raw.total_booked ?? appointments.length,
      completed_count: appointments.filter((a) => a.status === 'Completed').length,
    };
  },

  getPatientAppointments: async (
    patientId: string,
    onlyActive?: boolean
  ): Promise<{ items: Appointment[] }> => {
    const response = await apiClient.getInstance('SCHEDULING').get(
      `/scheduling/patients/${patientId}/appointments`,
      { params: { only_active: onlyActive } }
    );

    type RawDTO = {
      id: string;
      patient_id: string;
      professional_id: string;
      clinic_id: string;
      procedure_code: string;
      slot_start: string;
      slot_end: string;
      status: string;
      coverage_type?: string;
      created_at: string;
    };

    // Backend returns []AppointmentDTO directly (array, not wrapped)
    const raw: RawDTO[] = Array.isArray(response.data)
      ? (response.data as RawDTO[])
      : ((response.data as { items?: RawDTO[] }).items ?? []);

    return {
      items: raw.map((dto) => ({
        appointment_id: dto.id,
        patient_id: dto.patient_id,
        patient_name: dto.patient_id,
        professional_id: dto.professional_id,
        professional_name: dto.professional_id,
        clinic_id: dto.clinic_id,
        procedure_code: dto.procedure_code,
        procedure_name: dto.procedure_code,
        slot_start: dto.slot_start,
        slot_end: dto.slot_end,
        status: dto.status as Appointment['status'],
        coverage_type: dto.coverage_type,
        created_at: dto.created_at,
      })),
    };
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

  holdSlot: async (data: {
    professional_id: string;
    clinic_id: string;
    slot_start: string;
    slot_end: string;
  }): Promise<{ hold_id: string; expires_at: string }> => {
    const res = await apiClient.getInstance('SCHEDULING').post<{ hold_id: string; expires_at: string }>(
      '/scheduling/hold', data,
    );
    return res.data;
  },

  releaseHold: async (holdId: string): Promise<void> => {
    await apiClient.getInstance('SCHEDULING').delete(`/scheduling/hold/${holdId}`);
  },
};
