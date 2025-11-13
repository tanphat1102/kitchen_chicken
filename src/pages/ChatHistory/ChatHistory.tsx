import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import storeService, { type Store } from '@/services/storeService';
import { useAIChat } from '@/hooks/useAIChat';
import { motion } from 'framer-motion';
import logo from '@/assets/img/Logo.png';

const ChatHistoryPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number>(1);
  const [loadingStores, setLoadingStores] = useState(true);

  // Get user photo from localStorage userInfo
  const getUserPhotoURL = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed.photoURL || '';
      }
    } catch (e) {
      console.error('Failed to parse userInfo:', e);
    }
    return '';
  };
  const userPhotoURL = getUserPhotoURL();

  const { messages, isLoading, page, setPage, totalPages, refetch } = useAIChat(storeId, {
    pageSize: 50,
    autoRefreshMs: 0, // no polling on history page
    asc: true,
  });

  // Fetch stores
  useEffect(() => {
    let mounted = true;
    async function fetchStores() {
      setLoadingStores(true);
      try {
        const list = await storeService.getAllForStats();
        if (mounted) {
          setStores(list);
          if (list.length > 0) {
            setStoreId(list[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load stores:', e);
      } finally {
        if (mounted) setLoadingStores(false);
      }
    }
    fetchStores();
    return () => { mounted = false; };
  }, []);

  const handleStoreChange = (newStoreId: number) => {
    setStoreId(newStoreId);
    setPage(1);
  };

  const selectedStore = stores.find(s => s.id === storeId);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 pt-20">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-black text-gray-900 mb-2">Chat History</h1>
            <p className="text-gray-600">View all your AI assistant conversations</p>
          </motion.div>

          {/* Store selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Store</label>
            <select
              value={storeId}
              onChange={(e) => handleStoreChange(Number(e.target.value))}
              disabled={loadingStores}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {selectedStore && (
              <p className="mt-2 text-xs text-gray-500">
                Viewing conversations with <span className="font-semibold">{selectedStore.name}</span>
              </p>
            )}
          </motion.div>

          {/* Messages */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 min-h-[500px] flex flex-col"
          >
            <div className="flex-1 space-y-4 mb-6">
              {isLoading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-500"></div>
                  <p className="mt-3 text-gray-600 text-sm">Loading messages...</p>
                </div>
              )}

              {!isLoading && messages.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-600 font-medium">No messages yet</p>
                  <p className="text-gray-500 text-sm mt-1">Start a conversation using the chat widget!</p>
                </div>
              )}

              {messages.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant avatar (logo) */}
                  {m.role === 'assistant' && (
                    <img 
                      src={logo} 
                      alt="AI" 
                      className="w-9 h-9 rounded-full flex-shrink-0 object-cover border-2 border-red-200"
                    />
                  )}

                  <div className={`max-w-[70%] ${m.role === 'user' ? '' : ''}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        m.role === 'user'
                          ? 'bg-red-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.content}</p>
                    </div>
                    <p className={`text-[10px] text-gray-500 mt-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(m.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  {/* User avatar (photoURL) */}
                  {m.role === 'user' && (
                    userPhotoURL ? (
                      <img 
                        src={userPhotoURL} 
                        alt="You" 
                        className="w-9 h-9 rounded-full flex-shrink-0 object-cover border-2 border-red-300"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex-shrink-0 bg-red-500 text-white flex items-center justify-center text-sm font-bold">
                        U
                      </div>
                    )
                  )}
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              className="mt-4 w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Refresh Messages
            </button>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default ChatHistoryPage;
