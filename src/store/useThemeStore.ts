import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  isDarkMode: boolean;
  indicatorColor: string; // Added indicator color
  textColor: string; // Added text color
  toggleTheme: () => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      indicatorColor: "#ed1c23", // Default indicator color
      textColor: "#ed1c23", // Default text color
      toggleTheme: () =>
        set((state) => ({
          isDarkMode: !state.isDarkMode,
          indicatorColor: state.isDarkMode ? "#ed1c23" : "#ff891e", // Switch indicator color
          textColor: state.isDarkMode ? "#ed1c23" : "#ff891e", // Switch text color
        })),
    }),
    {
      name: "theme-storage",
    }
  )
);

export default useThemeStore;
