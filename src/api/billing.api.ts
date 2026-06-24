import { apiClient } from './api.client';
import type { Quote, Payment, RegisterPaymentCommand, PatientAccount } from '../types/billing.types';

export const billingApi = {
  getQuote: async (quoteId: string): Promise<Quote> => {
    const response = await apiClient.getInstance('BILLING').get(`/billing/quotes/${quoteId}`);
    return response.data;
  },

  getAppointmentQuote: async (appointmentId: string): Promise<Quote> => {
    const response = await apiClient
      .getInstance('BILLING')
      .get(`/billing/appointments/${appointmentId}/quote`);
    return response.data;
  },

  getPatientAccount: async (patientId: string): Promise<PatientAccount> => {
    const response = await apiClient
      .getInstance('BILLING')
      .get(`/billing/patients/${patientId}/account`);
    return response.data;
  },

  getPatientQuotes: async (patientId: string): Promise<{ items: Quote[] }> => {
    const response = await apiClient
      .getInstance('BILLING')
      .get(`/billing/patients/${patientId}/quotes`);
    return response.data;
  },

  registerPayment: async (quoteId: string, data: RegisterPaymentCommand): Promise<Payment> => {
    const response = await apiClient
      .getInstance('BILLING')
      .post(`/billing/quotes/${quoteId}/payments`, data);
    return response.data;
  },

  initMercadoPagoPayment: async (quoteId: string) => {
    const response = await apiClient
      .getInstance('BILLING')
      .post(`/billing/quotes/${quoteId}/payments/mercadopago`);
    return response.data as { checkout_url: string };
  },

  voidQuote: async (quoteId: string, reason: string): Promise<void> => {
    await apiClient.getInstance('BILLING').post(`/billing/quotes/${quoteId}/void`, { reason });
  },

  refundQuote: async (quoteId: string, reason: string): Promise<void> => {
    await apiClient.getInstance('BILLING').post(`/billing/quotes/${quoteId}/refund`, { reason });
  },

  getDailyReport: async (date: string) => {
    const response = await apiClient
      .getInstance('BILLING')
      .get('/billing/reports/daily', { params: { date } });
    return response.data;
  },
};
