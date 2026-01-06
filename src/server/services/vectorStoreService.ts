/**
 * 向量存储服务
 * 提供向量的存储、检索和相似度计算功能
 */
import vectorPersistence from './vectorPersistence.js';

export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    filename: string;
    uploadTime: number;
    chunkIndex: number;
    category?: 'hr' | 'it' | 'general';
    [key: string]: any;
  };
}

export interface VectorSearchResult {
  content: string;
  score: number;
  metadata: VectorDocument['metadata'];
}

/**
 * 向量存储服务类
 */
export class VectorStoreService {
  private documents: Map<string, VectorDocument> = new Map();
  private autoSave: boolean = true;

  /**
   * 从持久化存储加载数据
   */
  loadFromPersistence(): void {
    try {
      const cachedDocs = vectorPersistence.load();
      if (cachedDocs.length > 0) {
        // 恢复文档到内存
        this.documents.clear();
        for (const doc of cachedDocs) {
          this.documents.set(doc.id, doc);
        }
        console.log(`[VectorStore] Restored ${this.documents.size} documents from persistence`);
      }
    } catch (error) {
      console.error('[VectorStore] Error loading from persistence:', error);
    }
  }

  /**
   * 保存到持久化存储
   */
  saveToPersistence(): void {
    try {
      const docsArray = Array.from(this.documents.values());
      vectorPersistence.save(docsArray);
    } catch (error) {
      console.error('[VectorStore] Error saving to persistence:', error);
    }
  }

  /**
   * 设置是否自动保存
   */
  setAutoSave(enabled: boolean): void {
    this.autoSave = enabled;
  }

  /**
   * 添加文档
   * @param content 文档内容
   * @param embedding 向量
   * @param metadata 元数据
   * @returns 文档 ID
   */
  addDocument(content: string, embedding: number[], metadata: any): string {
    const doc: VectorDocument = {
      id: this.generateId(),
      content,
      embedding,
      metadata: {
        ...metadata,
        uploadTime: Date.now()
      }
    };

    this.documents.set(doc.id, doc);

    // 自动保存
    if (this.autoSave) {
      this.saveToPersistence();
    }

    return doc.id;
  }

  /**
   * 批量添加文档
   * @param items 文档项数组
   * @returns 文档 ID 数组
   */
  addDocumentsBatch(items: Array<{ content: string; embedding: number[]; metadata: any }>): string[] {
    // 批量添加时禁用自动保存，添加完成后再保存一次
    const originalAutoSave = this.autoSave;
    this.autoSave = false;

    const ids = items.map(item => this.addDocument(item.content, item.embedding, item.metadata));

    if (originalAutoSave) {
      this.saveToPersistence();
    }
    this.autoSave = originalAutoSave;

    return ids;
  }

  /**
   * 计算余弦相似度
   * @param vec1 向量1
   * @param vec2 向量2
   * @returns 相似度值（0-1）
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (magnitude === 0) return 0;
    return dotProduct / magnitude;
  }

  /**
   * 向量检索
   * @param queryEmbedding 查询向量
   * @param topK 返回前K个结果
   * @param threshold 相似度阈值
   * @returns 检索结果数组
   */
  search(queryEmbedding: number[], topK: number = 5, threshold: number = 0.6): VectorSearchResult[] {
    const results: Array<{ doc: VectorDocument; score: number }> = [];

    for (const doc of this.documents.values()) {
      const score = this.cosineSimilarity(queryEmbedding, doc.embedding);

      if (score >= threshold) {
        results.push({ doc, score });
      }
    }

    // 按相似度降序排序
    results.sort((a, b) => b.score - a.score);

    // 返回Top-K
    return results.slice(0, topK).map(({ doc, score }) => ({
      content: doc.content,
      score,
      metadata: doc.metadata
    }));
  }

  /**
   * 根据文件名删除文档
   * @param filename 文件名
   * @returns 删除的文档数量
   */
  deleteByFilename(filename: string): number {
    let count = 0;
    for (const [id, doc] of this.documents.entries()) {
      if (doc.metadata.filename === filename) {
        this.documents.delete(id);
        count++;
      }
    }

    // 自动保存
    if (count > 0 && this.autoSave) {
      this.saveToPersistence();
    }

    return count;
  }

  /**
   * 获取所有文档
   * @returns 所有文档数组
   */
  getAllDocuments(): VectorDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * 删除文档
   * @param id 文档 ID
   * @returns 是否删除成功
   */
  deleteDocument(id: string): boolean {
    const deleted = this.documents.delete(id);

    // 自动保存
    if (deleted && this.autoSave) {
      this.saveToPersistence();
    }

    return deleted;
  }

  /**
   * 清空所有文档
   */
  clearAll(): void {
    this.documents.clear();

    // 自动保存
    if (this.autoSave) {
      this.saveToPersistence();
    }
  }

  /**
   * 获取统计信息
   * @returns 统计信息对象
   */
  getStats() {
    return {
      totalDocuments: this.documents.size,
      filenames: [...new Set(Array.from(this.documents.values()).map(d => d.metadata.filename))],
      categoryCount: {
        hr: Array.from(this.documents.values()).filter(d => d.metadata.category === 'hr').length,
        it: Array.from(this.documents.values()).filter(d => d.metadata.category === 'it').length,
        general: Array.from(this.documents.values()).filter(d => d.metadata.category === 'general').length
      }
    };
  }

  /**
   * 生成唯一 ID
   * @returns 唯一 ID 字符串
   */
  private generateId(): string {
    return `vec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// 导出单例
export default new VectorStoreService();
