export interface Patient {
  patient_id: string;
  full_name: string;
  birth_date: string;
  gender: string;
  doc_type: string;
  doc_number: string;
  phone: string;
  email?: string;
  emergency_name?: string;
  emergency_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Coverage {
  coverage_id: string;
  coverage_type: string;
  provider_name: string;
  plan_code: string;
  membership_number: string;
  valid_from: string;
  valid_until?: string;
  co_pay_percent?: number;
  co_pay_fixed_cents?: number;
}

export interface MedicalAlert {
  alert_id: string;
  alert_type: string;
  severity?: string;
  description: string;
  is_self_reported: boolean;
  created_at: string;
}

export interface DuplicateCandidate {
  patient_id: string;
  full_name: string;
  score: number;
  matched_on: string[];
}

export interface RegisterPatientCommand {
  full_name: string;
  birth_date: string;
  gender: string;
  doc_type: string;
  doc_number: string;
  phone: string;
  email?: string;
  emergency_name?: string;
  emergency_phone?: string;
  skip_duplicate_check?: boolean;
}

export interface PatientSearchParams {
  q?: string;
  limit?: number;
  offset?: number;
}

export interface PatientListResponse {
  items: Patient[];
  total: number;
  limit: number;
  offset: number;
}
