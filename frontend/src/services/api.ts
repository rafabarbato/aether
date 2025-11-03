import axios, { AxiosInstance, AxiosError } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Token expired, try to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axios.post('/api/v1/auth/refresh-token', {
              refreshToken,
            });

            const { accessToken } = response.data.data.tokens;
            localStorage.setItem('accessToken', accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string, params?: any): Promise<T> {
    return this.api.get(url, { params }).then((res) => res.data);
  }

  public post<T>(url: string, data?: any): Promise<T> {
    return this.api.post(url, data).then((res) => res.data);
  }

  public put<T>(url: string, data?: any): Promise<T> {
    return this.api.put(url, data).then((res) => res.data);
  }

  public patch<T>(url: string, data?: any): Promise<T> {
    return this.api.patch(url, data).then((res) => res.data);
  }

  public delete<T>(url: string): Promise<T> {
    return this.api.delete(url).then((res) => res.data);
  }
}

export default new ApiService();
