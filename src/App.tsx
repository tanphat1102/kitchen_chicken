import { BrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppRoutes } from "@/routes/route.index";
import AuthErrorBoundary from "@/components/shared/AuthErrorBoundary";
import './App.css'

// Lazy load AI Chat - not critical for initial render
const FloatingAIChat = lazy(() => import("@/components/FloatingAIChat"));

function App() {
  return (
    <AuthErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
        <Suspense fallback={null}>
          <FloatingAIChat />
        </Suspense>
      </BrowserRouter>
    </AuthErrorBoundary>
  )
}

export default App
