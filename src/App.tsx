import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes/route.index";
import { Toaster } from "@/components/ui/sonner";
import AuthErrorBoundary from "@/components/shared/AuthErrorBoundary";
import QueryProvider from "@/providers/QueryProvider";
import LocalStorageTest from "@/components/LocalStorageTest";
import UploadTest from "@/components/UploadTest";
import { useEffect, useState } from "react";
import './App.css'

function App() {
  const [showStorageTest, setShowStorageTest] = useState(false);
  const [showUploadTest, setShowUploadTest] = useState(false);

  useEffect(() => {
    // Firebase Auth only - no Firestore monitoring
    console.log('🔥 App initialized - Firebase Auth ready');
  }, []);

  return (
    <QueryProvider>
      <AuthErrorBoundary>
        <BrowserRouter>
          {/* Test Toggles */}
          <div className="fixed top-4 right-4 z-[9999] flex gap-2 flex-col">
            <button
              onClick={() => setShowStorageTest(!showStorageTest)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
            >
              {showStorageTest ? '❌ Hide Storage' : '📱 Storage Test'}
            </button>
            <button
              onClick={() => setShowUploadTest(!showUploadTest)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
            >
              {showUploadTest ? '❌ Hide Upload' : '🖼️ Upload Test'}
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

          {/* Upload Test Component */}
          {showUploadTest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <UploadTest />
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
