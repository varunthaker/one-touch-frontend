// API Endpoints (relative paths - baseURL is handled by axios)
export const API_ENDPOINTS = {
  // Sabha Centers
  SABHA_CENTERS: '/api/sabha_centers/',
  
  // Sabhas
  SABHAS: '/api/sabhas/',
  
  // Youths
  YOUTHS: '/api/youths/',
  YOUTHS_BY_SABHA_CENTER: (sabhaCenterId: number) => `/api/youths/?sabha_center_id=${sabhaCenterId}`,
  YOUTHS_KARYAKARTA: (sabhaCenterId: number) => `/api/youths/get-all-karyakarta?sabha_center_id=${sabhaCenterId}`,
  
  // Attendance
  ATTENDANCE: '/api/attendance/',
  ATTENDANCE_BY_SABHA: (sabhaId: number) => `/api/attendance/${sabhaId}`,
}; 