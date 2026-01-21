/**
 * 知识库状态管理
 */
import { create } from 'zustand';
import {
  getKnowledgeList,
  uploadKnowledgeFile,
  deleteKnowledgeDocument,
  initializeBuiltinKnowledge,
  type KnowledgeDocument,
  type KnowledgeListResponse,
} from '../services/knowledgeService';

interface KnowledgeStoreState {
  // 状态
  documents: KnowledgeDocument[];
  totalChunks: number;
  totalVectors: number;
  categoryCount: {
    hr: number;
    it: number;
    general: number;
  };
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  uploadProgress: number;

  // 操作
  fetchDocuments: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  deleteDocument: (filename: string) => Promise<void>;
  initializeBuiltin: () => Promise<void>;
  clearError: () => void;
  setUploadProgress: (progress: number) => void;
}

export const useKnowledgeStore = create<KnowledgeStoreState>((set, get) => ({
  // 初始状态
  documents: [],
  totalChunks: 0,
  totalVectors: 0,
  categoryCount: {
    hr: 0,
    it: 0,
    general: 0,
  },
  isLoading: false,
  isUploading: false,
  error: null,
  uploadProgress: 0,

  // 获取文档列表
  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data: KnowledgeListResponse = await getKnowledgeList();
      set({
        documents: data.documents,
        totalChunks: data.totalChunks,
        totalVectors: data.totalVectors,
        categoryCount: data.categoryCount,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  // 上传文件
  uploadFile: async (file: File) => {
    set({ isUploading: true, error: null, uploadProgress: 0 });

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        set((state) => ({
          uploadProgress: Math.min(state.uploadProgress + 10, 90),
        }));
      }, 200);

      const result = await uploadKnowledgeFile(file);

      clearInterval(progressInterval);
      set({ uploadProgress: 100 });

      // 重新获取文档列表
      await get().fetchDocuments();
      void result; // 避免未使用警告

      set({
        isUploading: false,
        uploadProgress: 0,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        isUploading: false,
        uploadProgress: 0,
      });
    }
  },

  // 删除文档
  deleteDocument: async (filename: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteKnowledgeDocument(filename);
      await get().fetchDocuments();
      set({ isLoading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  // 初始化内置知识库
  initializeBuiltin: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await initializeBuiltinKnowledge();
      console.log('[Knowledge] Initialize result:', result);
      await get().fetchDocuments();
      set({ isLoading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  // 清除错误
  clearError: () => set({ error: null }),

  // 设置上传进度
  setUploadProgress: (progress: number) => set({ uploadProgress: progress }),
}));
