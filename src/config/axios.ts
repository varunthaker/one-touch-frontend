import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { userManager } from '../auth/zitadelConfig';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get current user from userManager
      const user = await userManager.getUser();
      
      if (user && user.access_token) {
        // Add Authorization header with Bearer token
        config.headers.set('Authorization', `Bearer ${user.id_token}`);
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
        // Try to refresh the token
        const user = await userManager.getUser();
        if (user) {
          const refreshedUser = await userManager.signinSilent();
          if (refreshedUser && refreshedUser.id_token) {
            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${refreshedUser.id_token}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login if refresh fails
        await userManager.signinRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 