import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URLS = {
  IAM: import.meta.env.VITE_API_BASE_URL_IAM as string,
  PATIENT: import.meta.env.VITE_API_BASE_URL_PATIENT as string,
  PROFESSIONAL: import.meta.env.VITE_API_BASE_URL_PROFESSIONAL as string,
  SCHEDULING: import.meta.env.VITE_API_BASE_URL_SCHEDULING as string,
  COVERAGE: import.meta.env.VITE_API_BASE_URL_COVERAGE as string,
  BILLING: import.meta.env.VITE_API_BASE_URL_BILLING as string,
  NOTIFICATIONS: import.meta.env.VITE_API_BASE_URL_NOTIFICATIONS as string,
};

class ApiClient {
  private instances: Map<string, AxiosInstance>;

  constructor() {
    this.instances = new Map();
    this.initializeInstances();
  }

  private initializeInstances(): void {
    Object.entries(API_BASE_URLS).forEach(([key, baseURL]) => {
      const instance = axios.create({
        baseURL,
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      });

      instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
          const token = localStorage.getItem('access_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      instance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
          if (error.response?.status === 401) {
            const refreshed = await this.refreshToken();
            if (refreshed && error.config) {
              return instance.request(error.config);
            }
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      );

      this.instances.set(key, instance);
    });
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    const userId = localStorage.getItem('user_id');
    if (!refreshToken || !userId) return false;

    try {
      const response = await axios.post(`${API_BASE_URLS.IAM}/auth/refresh`, {
        refresh_token: refreshToken,
        user_id: userId,
        device_id: navigator.userAgent,
      });
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  getInstance(service: keyof typeof API_BASE_URLS): AxiosInstance {
    const instance = this.instances.get(service);
    if (!instance) throw new Error(`Service ${service} not found`);
    return instance;
  }
}

export const apiClient = new ApiClient();
export { API_BASE_URLS };
