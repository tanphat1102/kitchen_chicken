import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes/route.index";
import { Toaster } from "@/components/ui/sonner";
import AuthErrorBoundary from "@/components/shared/AuthErrorBoundary";
import QueryProvider from "@/providers/QueryProvider";
import LocalStorageTest from "@/components/LocalStorageTest";
import { useEffect, useState } from "react";
import './App.css'

function App() {
  const [showStorageTest, setShowStorageTest] = useState(false);

  useEffect(() => {
    // Firebase Auth only - no Firestore monitoring
    console.log('🔥 App initialized - Firebase Auth ready');
  }, []);

  return (
    <QueryProvider>
      <AuthErrorBoundary>
        <BrowserRouter>
          {/* Storage Test Toggle */}
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setShowStorageTest(!showStorageTest)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              {showStorageTest ? '❌ Hide Storage Test' : '� Storage Test'}
            </button>
          </div>

          {/* Local Storage Test Component */}
          {showStorageTest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <LocalStorageTest />
              </div>
            </div>
          )}

          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </AuthErrorBoundary>
    </QueryProvider>
  )
}

export default App
