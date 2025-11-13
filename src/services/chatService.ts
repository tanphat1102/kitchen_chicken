import api from '@/config/axios';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string; // ISO timestamp
}

export interface ChatHistoryPage {
  items: ChatMessage[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ChatHistoryResponse {
  statusCode: number;
  message: string;
  data: ChatHistoryPage;
}

export interface SendChatRequest {
  message: string;
  storeId: number;
}

export interface SendChatResponse {
  statusCode: number;
  message: string;
  data?: any; // API may return assistant message asynchronously; keep flexible
}

const chatService = {
  async getHistory(page = 1, size = 20, asc = false): Promise<ChatHistoryPage> {
    const res = await api.get<ChatHistoryResponse>(`/api/ai/chat/history`, {
      params: { page, size, asc },
    });
    return res.data.data;
  },
  async sendMessage(payload: SendChatRequest): Promise<SendChatResponse> {
    const res = await api.post<SendChatResponse>(`/api/ai/chat`, payload);
    return res.data;
  },
};

export default chatService;
