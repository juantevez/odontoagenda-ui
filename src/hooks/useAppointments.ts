import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulingApi } from '../api/scheduling.api';
import type {
  AvailabilityQuery,
  BookAppointmentCommand,
  CancelAppointmentCommand,
} from '../types/appointment.types';

export function usePatientAppointments(patientId: string, onlyActive?: boolean) {
  return useQuery({
    queryKey: ['appointments', 'patient', patientId, onlyActive],
    queryFn: () => schedulingApi.getPatientAppointments(patientId, onlyActive),
    enabled: Boolean(patientId),
  });
}

export function useAvailability(query: AvailabilityQuery) {
  return useQuery({
    queryKey: ['availability', query],
    queryFn: () => schedulingApi.getAvailability(query),
    enabled: Boolean(query.professional_id && query.clinic_id && query.date),
  });
}

export function useDaySchedule(params: { professional_id?: string; clinic_id?: string; date?: string }) {
  return useQuery({
    queryKey: ['day-schedule', params],
    queryFn: () => schedulingApi.getDaySchedule(params),
    enabled: Boolean(params.date),
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BookAppointmentCommand) => schedulingApi.bookAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelAppointmentCommand }) =>
      schedulingApi.cancelAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => schedulingApi.checkIn(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['day-schedule'] });
    },
  });
}
