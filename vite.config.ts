import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          // Admin bundle
          'admin': [
            './src/pages/admin/AdminDashboard.tsx',
            './src/pages/admin/AdminDashboard-realtime.tsx',
            './src/pages/admin/Stores.tsx',
            './src/pages/admin/Users.tsx',
            './src/pages/admin/Transactions.tsx',
            './src/pages/admin/PaymentMethods.tsx',
            './src/pages/admin/AdminProfile.tsx',
          ],
          // Manager bundle
          'manager': [
            './src/pages/manager/ManagerDashboard.tsx',
            './src/pages/manager/MenuItems.tsx',
            './src/pages/manager/Categories.tsx',
            './src/pages/manager/Ingredients.tsx',
            './src/pages/manager/ManagerDishes.tsx',
            './src/pages/manager/Orders.tsx',
            './src/pages/manager/Promotions.tsx',
            './src/pages/manager/ManagerProfile.tsx',
            './src/pages/manager/Nutrients.tsx',
            './src/pages/manager/Steps.tsx',
          ],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'esbuild', // Use esbuild for faster builds
    target: 'es2015', // Support modern browsers
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://chickenkitchen.milize-lena.space',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})
