import { create } from 'zustand';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface SabhaCenter {
  city: string;
  address: string;
  responsible_person: string;
  contact_number: string;
  name: string;
  id: number;
}

interface SabhaCenterState {
  sabhaCenters: SabhaCenter[];
  loading: boolean;
  error: string | null;
  fetchSabhaCenters: () => Promise<void>;
}

const useSabhaCenterStore = create<SabhaCenterState>((set) => ({
  sabhaCenters: [],
  loading: false,
  error: null,
  fetchSabhaCenters: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(API_ENDPOINTS.SABHA_CENTERS);
      set({ sabhaCenters: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred while fetching sabha centers',
        loading: false 
      });
    }
  },
}));

export default useSabhaCenterStore; 