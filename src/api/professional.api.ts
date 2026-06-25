import { apiClient } from './api.client';

export interface LicenseDTO {
  id: string;
  specialty_code: string;
  specialty_name: string;
  license_number: string;
  is_valid: boolean;
  expires_at?: string;
  status: string;
}

export interface Professional {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  bio?: string;
  status: string;
  licenses: LicenseDTO[];
}

export interface RegisterProfessionalCommand {
  full_name: string;
  doc_type: string;
  doc_number: string;
  email: string;
  phone: string;
  bio?: string;
}

export interface WeeklyScheduleSlot {
  weekday: number;
  start_hour: number;
  start_min: number;
  end_hour: number;
  end_min: number;
}

export const professionalApi = {
  register: async (data: RegisterProfessionalCommand) => {
    const response = await apiClient.getInstance('PROFESSIONAL').post('/professionals', data);
    return response.data as { professional_id: string };
  },

  listByClinic: async (params?: { clinic_id?: string; specialty?: string }): Promise<Professional[]> => {
    const response = await apiClient.getInstance('PROFESSIONAL').get('/professionals', { params });
    return response.data;
  },

  list: async (params?: { q?: string; limit?: number; offset?: number }) => {
    const response = await apiClient.getInstance('PROFESSIONAL').get('/professionals', { params });
    return response.data as Professional[];
  },

  getById: async (professionalId: string): Promise<Professional> => {
    const response = await apiClient.getInstance('PROFESSIONAL').get(`/professionals/${professionalId}`);
    return response.data;
  },

  getForScheduling: async (professionalId: string) => {
    const response = await apiClient.getInstance('PROFESSIONAL').get(
      `/professionals/${professionalId}/for-scheduling`
    );
    return response.data;
  },

  addLicense: async (
    professionalId: string,
    license: {
      specialty_code: string;
      specialty_name: string;
      license_number: string;
      issuing_body: string;
      issued_at: string;
      expires_at?: string;
      document_ref?: string;
    }
  ) => {
    const response = await apiClient.getInstance('PROFESSIONAL').post(
      `/professionals/${professionalId}/licenses`,
      license
    );
    return response.data as { license_id: string };
  },

  assignToClinic: async (
    professionalId: string,
    data: {
      clinic_id: string;
      specialties: string[];
      weekly_schedule: WeeklyScheduleSlot[];
      assigned_from: string;
    }
  ) => {
    const response = await apiClient.getInstance('PROFESSIONAL').post(
      `/professionals/${professionalId}/clinics`,
      data
    );
    return response.data as { assignment_id: string };
  },

  suspend: async (professionalId: string, reason: string): Promise<void> => {
    await apiClient.getInstance('PROFESSIONAL').post(`/professionals/${professionalId}/suspend`, {
      reason,
    });
  },
};
