import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes/route.index";
import { Toaster } from "@/components/ui/sonner";
import AuthErrorBoundary from "@/components/shared/AuthErrorBoundary";
import QueryProvider from "@/providers/QueryProvider";
import './App.css'

function App() {
  return (
    <QueryProvider>
      <AuthErrorBoundary>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </AuthErrorBoundary>
    </QueryProvider>
  )
}

export default App
