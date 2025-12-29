import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          'mui': [
            '@mui/material',
            '@mui/icons-material',
            '@mui/x-date-pickers',
            '@mui/x-charts',
          ],
          'emotion': ['@emotion/react', '@emotion/styled'],
          'clerk': ['@clerk/clerk-react'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'form': ['react-hook-form', 'react-phone-number-input'],
          'table': ['material-react-table', 'antd'],
          'utils': ['axios', 'zustand', 'date-fns', 'dayjs', 'export-to-csv'],
        },
      },
    },
  },
});
