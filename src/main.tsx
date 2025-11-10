import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import { TokenDebugger } from './utils/tokenDebugger';

// Enable token debugging in development
if (import.meta.env.DEV) {
  console.log('🔧 Development mode: Token debugger enabled');
  console.log('Use TokenDebugger.logTokenStatus() in console to check token status');
  
  // Log initial token status
  TokenDebugger.logTokenStatus();
}
import './styles/animations.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import QueryProvider from '@/providers/QueryProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <App />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryProvider>
  </StrictMode>,
)
