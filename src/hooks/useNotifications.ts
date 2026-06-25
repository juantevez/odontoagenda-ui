import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';

const DEFAULT_CLINIC_ID = 'a1000000-0000-0000-0000-000000000001';

export function useInbox(enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'inbox'],
    queryFn: () => notificationApi.list({ clinic_id: DEFAULT_CLINIC_ID, limit: 50 }),
    enabled,
    refetchInterval: 30_000, // refresca cada 30s
    staleTime: 20_000,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(DEFAULT_CLINIC_ID),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
