/**
 * 知识库 API 服务
 */
import { useKeyStore } from '../store/keyStore';

/**
 * 获取 API 密钥的辅助函数
 */
function getApiKey(): string {
  const apiKey = useKeyStore.getState().getModelScopeKey();
  if (!apiKey) {
    throw new Error('请先配置 API 密钥');
  }
  return apiKey;
}

export interface KnowledgeDocument {
  filename: string;
  category: 'hr' | 'it' | 'general';
  chunkCount: number;
  uploadTime: number;
  builtin: boolean;
}

export interface KnowledgeListResponse {
  documents: KnowledgeDocument[];
  totalChunks: number;
  totalVectors: number;
  categoryCount: {
    hr: number;
    it: number;
    general: number;
  };
}

export interface UploadResponse {
  documentId: string;
  fileName: string;
  category: 'hr' | 'it' | 'general';
  chunkCount: number;
  vectorsGenerated: number;
}

export interface DeleteResponse {
  success: boolean;
  deletedChunks: number;
}

/**
 * 获取知识库列表
 */
export async function getKnowledgeList(): Promise<KnowledgeListResponse> {
  const response = await fetch('/api/knowledge');
  if (!response.ok) {
    throw new Error('获取知识库列表失败');
  }
  return await response.json();
}

/**
 * 上传知识库文件
 */
export async function uploadKnowledgeFile(file: File): Promise<UploadResponse> {
  const apiKey = getApiKey();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('apiKey', apiKey);

  const response = await fetch('/api/knowledge/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '上传失败');
  }

  return await response.json();
}

/**
 * 删除知识库文档
 */
export async function deleteKnowledgeDocument(filename: string): Promise<DeleteResponse> {
  const response = await fetch(`/api/knowledge/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('删除失败');
  }

  return await response.json();
}

/**
 * 初始化内置知识库
 */
export async function initializeBuiltinKnowledge(): Promise<{ success: boolean; message: string; stats?: any }> {
  const apiKey = getApiKey();

  const response = await fetch('/api/knowledge/initialize-builtin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '初始化失败');
  }

  return await response.json();
}

/**
 * 获取知识库统计信息
 */
export async function getKnowledgeStats(): Promise<any> {
  const response = await fetch('/api/knowledge/stats');
  if (!response.ok) {
    throw new Error('获取统计信息失败');
  }
  return await response.json();
}
