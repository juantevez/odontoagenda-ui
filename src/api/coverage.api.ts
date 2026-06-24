import { apiClient } from './api.client';

export interface Agreement {
  agreement_id: string;
  name: string;
  provider_name: string;
  status: string;
  created_at: string;
}

export const coverageApi = {
  listAgreements: async (): Promise<{ items: Agreement[] }> => {
    const response = await apiClient.getInstance('COVERAGE').get('/agreements');
    return response.data;
  },

  getAgreement: async (agreementId: string): Promise<Agreement> => {
    const response = await apiClient.getInstance('COVERAGE').get(`/agreements/${agreementId}`);
    return response.data;
  },

  calculateCoverage: async (params: {
    agreement_id: string;
    procedure_code: string;
    base_price_cents: number;
  }) => {
    const response = await apiClient
      .getInstance('COVERAGE')
      .get('/coverage/calculate', { params });
    return response.data;
  },

  verifyAffiliation: async (params: {
    agreement_id: string;
    membership_number: string;
  }) => {
    const response = await apiClient
      .getInstance('COVERAGE')
      .get('/coverage/verify-affiliation', { params });
    return response.data;
  },

  requestAuthorization: async (data: {
    patient_id: string;
    agreement_id: string;
    procedure_code: string;
    appointment_id: string;
  }) => {
    const response = await apiClient.getInstance('COVERAGE').post('/authorizations', data);
    return response.data as { authorization_id: string };
  },
};
