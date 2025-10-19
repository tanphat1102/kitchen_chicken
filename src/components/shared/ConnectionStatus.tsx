import React, { useState, useEffect } from 'react';
import { FirestoreConnectionManager } from '@/utils/firestoreConnectionManager';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

export const ConnectionStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    isOnline: true,
    reconnectAttempts: 0
  });

  useEffect(() => {
    // Update connection status every few seconds
    const interval = setInterval(() => {
      setConnectionStatus(FirestoreConnectionManager.getConnectionStatus());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Don't show anything if connection is good
  if (connectionStatus.isOnline && connectionStatus.reconnectAttempts === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {!connectionStatus.isOnline ? (
        <div className="flex items-center gap-2 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-md shadow-md">
          <WifiOff size={16} />
          <span className="text-sm font-medium">
            Mất kết nối
            {connectionStatus.reconnectAttempts > 0 && (
              <span className="ml-1">
                (Thử lại {connectionStatus.reconnectAttempts}/3)
              </span>
            )}
          </span>
        </div>
      ) : connectionStatus.reconnectAttempts > 0 ? (
        <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-700 px-3 py-2 rounded-md shadow-md">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">
            Đang kết nối lại... ({connectionStatus.reconnectAttempts}/3)
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded-md shadow-md">
          <Wifi size={16} />
          <span className="text-sm font-medium">Đã kết nối</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;