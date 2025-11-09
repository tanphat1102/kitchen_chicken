import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes/route.index";
import AuthErrorBoundary from "@/components/shared/AuthErrorBoundary";
import './App.css'

function App() {
  return (
    <AuthErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthErrorBoundary>
  )
}

export default App
