import { create } from "zustand";
import axiosInstance from "../config/axios";
import useSabhaSelectorStore from "./useSabhaSelectorStore";
import { API_ENDPOINTS } from "../config/api";

interface SabhaCenter {
  city: string;
  address: string;
  responsible_person: string;
  contact_number: string;
  name: string;
  id: number;
}

interface Youth {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  birth_date: string;
  origin_city_india: string;
  current_city_germany: string;
  is_active: boolean;
  karyakarta_id: number;
  educational_field: string;
  created_at: string;
  id: number;
  karyakarta_name: string; // Added karyakarta name
  sabha_centers: SabhaCenter[];
}

interface YouthsState {
  youths: Youth[];
  loading: boolean;
  error: string | null;
  fetchYouths: () => Promise<void>;
}

const useYouthsStore = create<YouthsState>((set) => ({
  youths: [],
  loading: false,
  error: null,
  fetchYouths: async () => {
    const selectedCity = useSabhaSelectorStore.getState().selectedCity;

    if (!selectedCity) {
      set({ youths: [], loading: false, error: null });
      return;
    }

    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.get(API_ENDPOINTS.YOUTHS_BY_SABHA_CENTER(selectedCity));
      set({ youths: response.data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred while fetching youths",
        loading: false,
        youths: [],
      });
    }
  },
}));

export default useYouthsStore;
