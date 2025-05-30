import { create } from 'zustand';

interface EventState {
  currentSabhaId: number | null;
  setCurrentSabhaId: (id: number) => void;
  clearCurrentSabhaId: () => void;
}

const useEventStore = create<EventState>((set) => ({
  currentSabhaId: null,
  setCurrentSabhaId: (id: number) => set({ currentSabhaId: id }),
  clearCurrentSabhaId: () => set({ currentSabhaId: null }),
}));

export default useEventStore; 