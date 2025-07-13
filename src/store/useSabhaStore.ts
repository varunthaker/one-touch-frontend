import { create } from 'zustand';
import axios from 'axios';
import useSabhaSelectorStore from './useSabhaSelectorStore';
import { API_ENDPOINTS } from '../config/api';

interface Sabha {
  topic: string;
  speaker_name: string;
  date: string;
  sabha_center_id: number;
  id: number;
}

interface SabhaState {
  sabhas: Sabha[];
  loading: boolean;
  error: string | null;
  fetchSabhas: () => Promise<void>;
}

const useSabhaStore = create<SabhaState>((set) => ({
  sabhas: [],
  loading: false,
  error: null,
  fetchSabhas: async () => {
    const selectedSabhaCenter = useSabhaSelectorStore.getState().selectedCity;
    
    if (!selectedSabhaCenter) {
      set({ sabhas: [], loading: false, error: null });
      return;
    }

    try {
      set({ loading: true, error: null });
      const response = await axios.get(`${API_ENDPOINTS.SABHAS}?sabha_center_id=${selectedSabhaCenter}`);
      set({ sabhas: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred while fetching sabhas',
        loading: false,
        sabhas: []
      });
    }
  },
}));

export default useSabhaStore; 