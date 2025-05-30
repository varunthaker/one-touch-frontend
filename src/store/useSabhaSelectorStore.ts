import { create } from 'zustand';

type SabhaSelectorStore = {
  selectedCity: number | null;
  selectedSabhaCenterName: string;
  selectCity: (value: number) => void;
  selectSabhaCenterName: (value: string) => void;
  clearCity: () => void;
};

const useSabhaSelectorStore = create<SabhaSelectorStore>((set) => ({
  selectedCity: null,
  selectedSabhaCenterName: '',
  selectCity: (value) => set(() => ({ selectedCity: value })),
  selectSabhaCenterName: (value) => set(() => ({ selectedSabhaCenterName: value })),
  clearCity: () => set(() => ({ selectedCity: null, selectedSabhaCenterName: '' })),
}));

export default useSabhaSelectorStore;