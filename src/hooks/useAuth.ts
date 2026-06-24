import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';

export function useAuth() {
  const { user, isAuthenticated, isLoading, error, login, logout, register, loadUser, clearError } =
    useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading && !user) {
      loadUser();
    }
  }, []);

  return { user, isAuthenticated, isLoading, error, login, logout, register, clearError };
}
