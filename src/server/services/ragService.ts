/**
 * RAG（检索增强生成）服务
 * 结合向量检索和 AI 生成，提供智能问答能力
 */
import ModelScopeService from './modelscopeService.js';
import vectorStoreService, { VectorSearchResult } from './vectorStoreService.js';

/**
 * RAG 服务类
 */
export class RAGService {
  private modelScopeService: ModelScopeService | null = null;

  /**
   * 设置 ModelScope 服务实例
   * @param service ModelScope 服务实例
   */
  setModelScopeService(service: ModelScopeService): void {
    this.modelScopeService = service;
  }

  /**
   * 检索相关文档
   * @param query 查询文本
   * @param topK 返回前K个结果
   * @param threshold 相似度阈值
   * @returns 检索结果数组
   */
  async retrieveDocuments(
    query: string,
    topK: number = 5,
    threshold: number = 0.6
  ): Promise<VectorSearchResult[]> {
    if (!this.modelScopeService) {
      throw new Error('ModelScope service not initialized');
    }

    try {
      // 1. 将查询向量化
      const queryEmbedding = await this.modelScopeService.generateEmbedding(query);

      // 2. 向量检索
      return vectorStoreService.search(queryEmbedding, topK, threshold);
    } catch (error) {
      console.error('[RAG] Retrieval error:', error);
      return [];
    }
  }

  /**
   * 构建增强上下文
   * @param query 查询文本
   * @returns 格式化的上下文字符串
   */
  async buildRAGContext(query: string): Promise<string> {
    const docs = await this.retrieveDocuments(query, 5, 0.5);

    if (docs.length === 0) {
      return '';
    }

    let context = '\n\n参考知识库内容：\n\n';
    docs.forEach((doc, index) => {
      context += `[${index + 1}] ${doc.content}\n`;
      context += `(相似度: ${(doc.score * 100).toFixed(1)}% | 来源: ${doc.metadata.filename})\n\n`;
    });

    return context;
  }

  /**
   * 添加文档到知识库
   * @param items 文档项数组
   * @param apiKey API 密钥
   */
  async addDocumentsToKnowledge(
    items: Array<{ content: string; metadata: any }>,
    apiKey: string
  ): Promise<void> {
    if (!this.modelScopeService) {
      this.modelScopeService = new ModelScopeService(apiKey);
    }

    try {
      // 批量生成向量
      const texts = items.map(item => item.content);
      console.log(`[RAG] Generating embeddings for ${texts.length} documents...`);
      const embeddings = await this.modelScopeService.generateEmbeddingsBatch(texts);
      console.log(`[RAG] Embeddings generated successfully`);

      // 添加到向量存储
      const docs = items.map((item, index) => ({
        content: item.content,
        embedding: embeddings[index],
        metadata: item.metadata
      }));

      const ids = vectorStoreService.addDocumentsBatch(docs);
      console.log(`[RAG] Added ${ids.length} documents to vector store`);
    } catch (error) {
      console.error('[RAG] Error adding documents:', error);
      throw error;
    }
  }

  /**
   * 删除指定文件的知识
   * @param filename 文件名
   * @returns 删除的文档数量
   */
  deleteKnowledge(filename: string): number {
    return vectorStoreService.deleteByFilename(filename);
  }

  /**
   * 获取知识库统计
   * @returns 统计信息
   */
  getKnowledgeStats() {
    return vectorStoreService.getStats();
  }

  /**
   * 清空知识库
   */
  clearKnowledge(): void {
    vectorStoreService.clearAll();
  }
}

// 导出单例
export default new RAGService();
