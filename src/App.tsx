import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes/route.index";
import AuthErrorBoundary from "@/components/shared/AuthErrorBoundary";
import FloatingAIChat from "@/components/FloatingAIChat";
import './App.css'

function App() {
  return (
    <AuthErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
        <FloatingAIChat />
      </BrowserRouter>
    </AuthErrorBoundary>
  )
}

export default App
