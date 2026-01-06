/**
 * 向量持久化服务
 * 负责向量数据的保存和恢复
 */
import fs from 'fs';
import path from 'path';
import type { VectorDocument } from './vectorStoreService.js';

const VECTOR_CACHE_FILE = path.join(process.cwd(), 'data', 'vectors.json');
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * 向量持久化服务类
 */
export class VectorPersistence {
  private cacheFilePath: string;

  constructor() {
    // 确保数据目录存在
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.cacheFilePath = VECTOR_CACHE_FILE;
  }

  /**
   * 保存向量数据到文件
   * @param documents 向量文档数组
   */
  save(documents: VectorDocument[]): void {
    try {
      // 只保存必要的数据（向量可能很大，考虑压缩）
      const data = JSON.stringify(documents, null, 2);
      fs.writeFileSync(this.cacheFilePath, data, 'utf-8');
      console.log(`[Persistence] Saved ${documents.length} vectors to ${this.cacheFilePath}`);
    } catch (error) {
      console.error('[Persistence] Error saving vectors:', error);
    }
  }

  /**
   * 从文件加载向量数据
   * @returns 向量文档数组，如果文件不存在或加载失败返回空数组
   */
  load(): VectorDocument[] {
    try {
      if (!fs.existsSync(this.cacheFilePath)) {
        console.log('[Persistence] No cache file found');
        return [];
      }

      const data = fs.readFileSync(this.cacheFilePath, 'utf-8');
      const documents: VectorDocument[] = JSON.parse(data);
      console.log(`[Persistence] Loaded ${documents.length} vectors from cache`);
      return documents;
    } catch (error) {
      console.error('[Persistence] Error loading vectors:', error);
      return [];
    }
  }

  /**
   * 检查缓存文件是否存在
   */
  exists(): boolean {
    return fs.existsSync(this.cacheFilePath);
  }

  /**
   * 删除缓存文件
   */
  clear(): void {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        fs.unlinkSync(this.cacheFilePath);
        console.log('[Persistence] Cache file cleared');
      }
    } catch (error) {
      console.error('[Persistence] Error clearing cache:', error);
    }
  }

  /**
   * 获取缓存文件的修改时间
   */
  getLastModified(): Date | null {
    try {
      if (!fs.existsSync(this.cacheFilePath)) {
        return null;
      }
      const stats = fs.statSync(this.cacheFilePath);
      return stats.mtime;
    } catch (error) {
      console.error('[Persistence] Error getting file stats:', error);
      return null;
    }
  }
}

// 导出单例
export default new VectorPersistence();
