import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'userMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './UserApp': './src/UserApp.tsx',
        './auth': './src/services/auth.ts',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: { target: 'esnext', minify: false, cssCodeSplit: false },
  server: { port: 5174, cors: true },
  preview: { port: 5174, strictPort: true, cors: true },
});
