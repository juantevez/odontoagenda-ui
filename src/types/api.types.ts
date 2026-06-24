export interface ApiError {
  code: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export type ServiceKey = 'IAM' | 'PATIENT' | 'PROFESSIONAL' | 'SCHEDULING' | 'COVERAGE' | 'BILLING';
