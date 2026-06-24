export type UserRole =
  | 'superadmin'
  | 'admin_sucursal'
  | 'profesional'
  | 'recepcionista'
  | 'paciente';

export interface User {
  user_id: string;
  role: UserRole;
  patient_id?: string;
  family_id?: string;
  is_guardian: boolean;
  clinic_ids?: string[];
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  access_token_expiry: number;
  refresh_token_expiry: number;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  device_id?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: string;
  family_name?: string;
}
