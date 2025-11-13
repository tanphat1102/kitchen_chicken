import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAIChat } from '@/hooks/useAIChat';

interface AIChatBoxProps {
  storeId: number;
  className?: string;
}

export const AIChatBox: React.FC<AIChatBoxProps> = ({ storeId, className }) => {
  const { messages, isLoading, isError, error, sendMessage, sending, refetch } = useAIChat(storeId, { pageSize: 20, autoRefreshMs: 5000, asc: false });
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className={`rounded-xl border bg-white shadow-lg ${className || ''}`}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          <h3 className="text-sm font-semibold text-gray-800">AI Assistant</h3>
        </div>
        <button onClick={() => refetch()} className="text-xs text-red-600 hover:text-red-700">Refresh</button>
      </div>

      <div ref={listRef} className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
        {isLoading && <p className="text-gray-500 text-sm">Loading chat...</p>}
        {isError && <p className="text-red-600 text-sm">{(error as any)?.message || 'Failed to load'}</p>}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`${m.role === 'user' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'} px-3 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap`}> 
              {m.content}
              <div className={`mt-1 text-[10px] ${m.role === 'user' ? 'text-red-100' : 'text-gray-500'}`}>{new Date(m.createdAt).toLocaleString('vi-VN')}</div>
            </div>
          </div>
        ))}

        {!isLoading && messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm">No messages yet. Say hello!</div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t px-3 py-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi món, gợi ý..."
          className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          title="Send"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default AIChatBox;
