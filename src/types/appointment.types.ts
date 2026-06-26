export type AppointmentStatus =
  // lowercase (legacy frontend / patient service)
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  // PascalCase (scheduling service / backend domain)
  | 'Pending'
  | 'Confirmed'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled'
  | 'NoShow';

export interface Appointment {
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  professional_id: string;
  professional_name: string;
  clinic_id: string;
  procedure_code: string;
  procedure_name: string;
  slot_start: string;
  slot_end: string;
  status: AppointmentStatus;
  coverage_type?: string;
  created_at: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  reason?: string;
}

export interface AvailabilityQuery {
  professional_id: string;
  clinic_id: string;
  date: string;
  procedure_code?: string;
}

export interface BookAppointmentCommand {
  patient_id: string;
  booked_by_id?: string;
  professional_id: string;
  clinic_id: string;
  procedure_code: string;
  slot_start: string;
  slot_end: string;
  coverage_type?: string;
  agreement_id?: string;
  requires_authorization?: boolean;
}

export interface CancelAppointmentCommand {
  reason: string;
  note?: string;
}

export interface DayScheduleEntry {
  appointment_id: string;
  slot_start: string;
  slot_end: string;
  patient_name: string;
  procedure_name: string;
  status: AppointmentStatus;
}
