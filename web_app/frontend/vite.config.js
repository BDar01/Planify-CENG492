
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfig from './tsconfig.json'; // Import your tsconfig.json file

export default defineConfig({
  plugins: [react()],
  // Use the tsconfig option to include your tsconfig.json configuration
  // This will ensure Vite uses the same TypeScript configuration
  tsconfig: tsconfig.compilerOptions,
});
