import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import chatService, { type ChatMessage } from '@/services/chatService';
import { useState, useEffect, useRef } from 'react';

interface UseAIChatOptions {
  pageSize?: number;
  autoRefreshMs?: number; // polling interval for new messages
  asc?: boolean;
}

export function useAIChat(storeId: number, opts: UseAIChatOptions = {}) {
  const { pageSize = 20, autoRefreshMs = 8000, asc = false } = opts;
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const pollingRef = useRef<number | null>(null);

  const historyQuery = useQuery({
    queryKey: ['aiChatHistory', page, pageSize, asc],
    queryFn: () => chatService.getHistory(page, pageSize, asc),
    staleTime: 5000,
  });

  const sendMutation = useMutation({
    mutationKey: ['aiChatSend'],
    mutationFn: async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) throw new Error('Message is empty');
      return chatService.sendMessage({ message: trimmed, storeId });
    },
    onSuccess: () => {
      // Refetch first page to include new messages
      queryClient.invalidateQueries({ queryKey: ['aiChatHistory'] });
    },
  });

  // Optional polling for new assistant replies
  useEffect(() => {
    if (autoRefreshMs <= 0) return;
    pollingRef.current = window.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['aiChatHistory', 1, pageSize, asc] });
    }, autoRefreshMs);
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, [autoRefreshMs, pageSize, asc, queryClient]);

  const messages: ChatMessage[] = historyQuery.data?.items || [];
  const totalPages = historyQuery.data?.totalPages || 1;

  return {
    page,
    setPage,
    messages,
    totalPages,
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
    error: historyQuery.error,
    refetch: historyQuery.refetch,
    sendMessage: (m: string) => sendMutation.mutate(m),
    sending: sendMutation.isPending,
  };
}
