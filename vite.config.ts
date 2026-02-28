import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://api.keykurs.ru'
    ),
    'import.meta.env.VITE_VK_CLIENT_ID': JSON.stringify(
      process.env.VITE_VK_CLIENT_ID || '54463778'
    ),
  },
});
