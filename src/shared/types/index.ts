// 共享类型定义

// ==================== API 密钥 ====================
export interface ApiKeys {
  modelscopeApiKey: string;
  xingyunAppId: string;
  xingyunAppSecret: string;
}

// ==================== 聊天消息 ====================
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string; // 支持多模态
  timestamp: Date;
  sources?: KnowledgeSource[]; // 知识库引用
  ticket?: Ticket; // 关联的工单（自动创建时）
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
}

// ==================== 知识库 ====================
export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  chunkCount: number;
  category: 'hr' | 'it' | 'general';
}

export interface TextChunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
  embedding?: number[];
  metadata: {
    fileName: string;
    fileType: string;
    chunkSize: number;
    createdAt: Date;
  };
}

export interface KnowledgeSource {
  chunkId: string;
  fileName: string;
  content: string;
  score: number;
}

// ==================== 工单 ====================
export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'hr' | 'it';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'processing' | 'completed' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

// ==================== API 请求/响应 ====================
export interface ChatRequest {
  message: string;
  sessionId: string;
  category?: 'hr' | 'it' | 'general';
  image?: string;
  conversationHistory?: ChatMessage[];
  apiKeys?: {
    modelScopeApiKey?: string;
  };
}

export interface ChatStreamResponse {
  content: string;
  sources?: KnowledgeSource[];
  ticket?: Ticket;
  done: boolean;
}

export interface UploadResponse {
  documentId: string;
  fileName: string;
  chunkCount: number;
  vectorsGenerated: number;
  category: 'hr' | 'it' | 'general';
}

export interface KnowledgeListResponse {
  documents: Document[];
  totalChunks: number;
  totalVectors: number;
}

// ==================== 数字人状态 ====================
export type AvatarState = 'offline' | 'connecting' | 'connected' | 'error';
export type AvatarActionState = 'idle' | 'listen' | 'think' | 'speak' | 'interactive_idle' | 'offlineMode';
