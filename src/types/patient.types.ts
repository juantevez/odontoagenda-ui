// Patient summary — devuelto por GET /patients (lista/búsqueda)
export interface Patient {
  id: string;           // backend devuelve "id"
  full_name: string;
  birth_date: string;
  age_years?: number;
  document_type: string;  // backend: "document_type"
  document_number: string; // backend: "document_number"
  phone: string;
  has_alerts?: boolean;
  risk_level?: string;
}

// Patient detail — devuelto por GET /patients/:id
export interface PatientDetail {
  id: string;
  full_name: string;
  birth_date: string;
  age_years: number;
  is_minor: boolean;
  gender: string;
  national_id: { type: string; number: string };
  contact_info: {
    phone: string;
    email?: string;
    whatsapp?: string;
    emergency_name?: string;
    emergency_phone?: string;
  };
  active_coverage?: Coverage;
  active_alerts: MedicalAlert[];
  created_at: string;
  updated_at?: string;
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
  has_more: boolean;
}
