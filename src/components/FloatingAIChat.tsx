import React, { useEffect, useState, useRef } from 'react';
import storeService, { type Store } from '@/services/storeService';
import { useAIChat } from '@/hooks/useAIChat';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/img/Logo.png';

// Facebook Messenger style floating chat with red theme
const STORAGE_KEY = 'aiChat.selectedStoreId';

export const FloatingAIChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Number(saved) : 1;
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentSessionMessages, setCurrentSessionMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
  }>>([]);

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

  const { messages, isLoading, sendMessage, sending } = useAIChat(storeId, { pageSize: 50, autoRefreshMs: 5000, asc: true });

  // Clear chat session
  const handleClearChat = () => {
    if (window.confirm('Bạn có chắc muốn xóa cuộc trò chuyện hiện tại?')) {
      setCurrentSessionMessages([]);
    }
  };

  // Add new message to current session when sending
  const handleSendMessage = (content: string) => {
    const userMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user' as const,
      content,
      createdAt: new Date().toISOString(),
    };
    setCurrentSessionMessages(prev => [...prev, userMessage]);
    sendMessage(content);
  };

  // Listen for new assistant messages from polling
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.role === 'assistant') {
        // Check if this message is not already in session
        const exists = currentSessionMessages.some(m => m.id === String(latestMessage.id));
        if (!exists) {
          setCurrentSessionMessages(prev => [...prev, {
            id: String(latestMessage.id),
            role: latestMessage.role,
            content: latestMessage.content,
            createdAt: latestMessage.createdAt,
          }]);
        }
      }
    }
  }, [messages]);

  // Show tooltip animation every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 4000); // Hide after 4s
    }, 15000);

    // Show first time after 2s
    const initialTimeout = setTimeout(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 4000);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  // Fetch stores
  useEffect(() => {
    let mounted = true;
    async function fetchStores() {
      try {
        const list = await storeService.getAllForStats();
        if (mounted) {
          setStores(list);
          if (list.length > 0 && !list.some(s => s.id === storeId)) {
            setStoreId(list[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load stores:', e);
      }
    }
    fetchStores();
    return () => { mounted = false; };
  }, [storeId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(storeId));
  }, [storeId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    handleSendMessage(trimmed);
    setInput('');
  };

  const selectedStore = stores.find(s => s.id === storeId);

  return (
    <>
      {/* Floating button with rotation */}
      <div className="fixed bottom-5 right-5 z-[100]">
        {/* Tooltip text */}
        <AnimatePresence>
          {showTooltip && !open && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute bottom-16 right-0 bg-white px-4 py-2.5 rounded-2xl shadow-2xl border border-red-200 whitespace-nowrap"
            >
              <p className="text-sm font-medium text-gray-800">
                Chicken Kitchen có thể giúp được gì cho bạn
              </p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-red-200 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          onClick={() => setOpen(!open)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-2xl hover:shadow-red-400/50 focus:outline-none flex items-center justify-center"
          aria-label="Open messenger chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
            <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>

      {/* Messenger-style popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-5 z-[100] w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <h3 className="font-semibold text-sm">{selectedStore?.name || 'AI Assistant'}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleClearChat}
                  className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                  title="Xóa cuộc trò chuyện"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Store selector */}
            <div className="px-3 py-2 border-b bg-gray-50">
              <select
                value={storeId}
                onChange={(e) => setStoreId(Number(e.target.value))}
                className="w-full text-xs px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
              {currentSessionMessages.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Bắt đầu cuộc trò chuyện mới...
                </div>
              )}
              {currentSessionMessages.map((m) => (
                <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {/* Assistant avatar (logo) */}
                  {m.role === 'assistant' && (
                    <img 
                      src={logo} 
                      alt="AI" 
                      className="w-7 h-7 rounded-full flex-shrink-0 object-cover border border-gray-200"
                    />
                  )}
                  
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      m.role === 'user'
                        ? 'bg-red-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>

                  {/* User avatar (photoURL) */}
                  {m.role === 'user' && (
                    userPhotoURL ? (
                      <img 
                        src={userPhotoURL} 
                        alt="You" 
                        className="w-7 h-7 rounded-full flex-shrink-0 object-cover border border-red-300"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full flex-shrink-0 bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                        U
                      </div>
                    )
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 bg-white border-t">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Aa"
                className="flex-1 px-3 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAIChat;
