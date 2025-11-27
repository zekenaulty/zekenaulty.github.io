import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/zekenaulty.github.io/',
  plugins: [react()],
});
