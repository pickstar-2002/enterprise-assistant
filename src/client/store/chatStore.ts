/**
 * 对话状态管理
 * 管理对话历史、流式响应状态和知识库引用
 */
import { create } from 'zustand';
import type { ChatMessage, ChatSession, KnowledgeSource } from '@shared/types';

interface ChatStoreState {
  // 基础状态
  sessionId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  sources: KnowledgeSource[];

  // 流式响应状态
  currentResponse: string;    // 当前流式响应（累积）
  currentSources: KnowledgeSource[]; // 当前知识库引用
  isProcessing: boolean;      // 是否正在处理

  // Actions
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, content: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setSources: (sources: KnowledgeSource[]) => void;

  // 流式响应 Actions
  appendCurrentResponse: (text: string) => void;  // 追加文本块
  setCurrentResponse: (response: string) => void; // 设置响应
  setCurrentSources: (sources: KnowledgeSource[]) => void;
  setProcessing: (processing: boolean) => void;

  // 获取对话历史（用于发送给后端）
  getConversationHistory: () => Array<{ role: string; content: string }>;
}

export const useChatStore = create<ChatStoreState>()((set, get) => ({
  // 基础状态
  sessionId: crypto.randomUUID(),
  messages: [],
  isLoading: false,
  sources: [],

  // 流式响应状态
  currentResponse: '',
  currentSources: [],
  isProcessing: false,

  // 基础 Actions
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (messageId, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, content } : msg
      ),
    })),

  setMessages: (messages) => set({ messages }),

  clearMessages: () =>
    set({
      messages: [],
      sessionId: crypto.randomUUID(),
      currentResponse: '',
      currentSources: []
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setSources: (sources) => set({ sources }),

  // 流式响应 Actions
  appendCurrentResponse: (text) =>
    set((state) => ({
      currentResponse: state.currentResponse + text
    })),

  setCurrentResponse: (response) =>
    set({ currentResponse: response }),

  setCurrentSources: (sources) =>
    set({ currentSources: sources }),

  setProcessing: (processing) =>
    set({ isProcessing: processing }),

  // 获取对话历史（用于发送给后端）
  getConversationHistory: () => {
    return get().messages.map(m => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
    }));
  }
}));
