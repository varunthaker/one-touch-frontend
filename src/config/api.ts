// API Configuration
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// API Endpoints
export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  // Sabha Centers
  SABHA_CENTERS: `${API_BASE_URL}/api/sabha_centers/`,
  
  // Sabhas
  SABHAS: `${API_BASE_URL}/api/sabhas/`,
  
  // Youths
  YOUTHS: `${API_BASE_URL}/api/youths/`,
  YOUTHS_BY_SABHA_CENTER: (sabhaCenterId: number) => `${API_BASE_URL}/api/youths/?sabha_center_id=${sabhaCenterId}`,
  YOUTHS_KARYAKARTA: (sabhaCenterId: number) => `${API_BASE_URL}/api/youths/get-all-karyakarta?sabha_center_id=${sabhaCenterId}`,
  
  // Attendance
  ATTENDANCE: `${API_BASE_URL}/api/attendance/`,
  ATTENDANCE_BY_SABHA: (sabhaId: number) => `${API_BASE_URL}/api/attendance/${sabhaId}`,
}; 