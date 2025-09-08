import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token getter function - this will be set by the auth context
let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
  tokenGetter = getter;
};

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      if (tokenGetter) {
        const token = await tokenGetter();
        
        if (token) {
          // Add Authorization header with Bearer token
          config.headers.set('Authorization', `Bearer ${token}`);
        }
      }
    } catch (error) {
      console.error('Error getting user token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (tokenGetter) {
          // Try to refresh the token using Auth0
          const refreshedToken = await tokenGetter();
          
          if (refreshedToken) {
            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login if refresh fails
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 