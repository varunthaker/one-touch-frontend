import { create } from 'zustand';

type SabhaSelectorStore = {
  selectedCity: number | null;
  selectCity: (value: number) => void;
  clearCity: () => void;
};

const useSabhaSelectorStore = create<SabhaSelectorStore>((set) => ({
  selectedCity: null,
  selectCity: (value) => set(() => ({ selectedCity: value })),
  clearCity: () => set(() => ({ selectedCity: null })),
}));

export default useSabhaSelectorStore;