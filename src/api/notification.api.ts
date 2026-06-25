import { apiClient } from './api.client';

export interface InboxNotification {
  id: string;
  type: string;
  clinic_id?: string;
  reference_id?: string;
  title: string;
  body: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface InboxResponse {
  items: InboxNotification[];
  unread_count: number;
}

export const notificationApi = {
  list: async (params: { clinic_id: string; unread_only?: boolean; limit?: number }): Promise<InboxResponse> => {
    const response = await apiClient.getInstance('NOTIFICATIONS').get('/notifications', { params });
    return response.data;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.getInstance('NOTIFICATIONS').patch(`/notifications/${id}/read`);
  },

  markAllRead: async (clinicId: string): Promise<void> => {
    await apiClient.getInstance('NOTIFICATIONS').post('/notifications/read-all', null, {
      params: { clinic_id: clinicId },
    });
  },
};
