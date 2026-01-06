/**
 * 文本分块服务
 * 将长文本分割成适合向量化的小块
 */

export interface ChunkConfig {
  maxChunkSize: number;
  chunkOverlap: number;
  minChunkSize: number;
  splitByParagraph: boolean;
}

export interface TextChunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
  metadata: {
    fileName: string;
    fileType: string;
    chunkSize: number;
    createdAt: Date;
  };
}

export class ChunkService {
  private config: ChunkConfig;

  constructor(config?: Partial<ChunkConfig>) {
    this.config = {
      maxChunkSize: 500,
      chunkOverlap: 50,
      minChunkSize: 100,
      splitByParagraph: true,
      ...config
    };
  }

  /**
   * 将文本分割成块
   * @param text 要分割的文本
   * @param documentId 文档ID
   * @param metadata 元数据
   * @returns 文本块数组
   */
  chunkText(
    text: string,
    documentId: string,
    metadata: { fileName: string; fileType: string }
  ): TextChunk[] {
    let chunks: TextChunk[] = [];

    if (this.config.splitByParagraph) {
      chunks = this.chunkByParagraph(text, documentId, metadata);
    } else {
      chunks = this.chunkBySize(text, documentId, metadata);
    }

    return chunks;
  }

  /**
   * 按段落分割文本
   */
  private chunkByParagraph(
    text: string,
    documentId: string,
    metadata: { fileName: string; fileType: string }
  ): TextChunk[] {
    const chunks: TextChunk[] = [];

    // 按标题和段落分割
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;

      // 如果单个段落就超过最大块大小，需要强制分割
      if (trimmed.length > this.config.maxChunkSize) {
        // 先保存当前累积的块
        if (currentChunk) {
          chunks.push(this.createChunk(currentChunk, documentId, chunkIndex++, metadata));
          currentChunk = '';
        }

        // 分割大段落
        const largeChunks = this.splitLargeText(trimmed);
        for (let i = 0; i < largeChunks.length; i++) {
          chunks.push(this.createChunk(largeChunks[i], documentId, chunkIndex++, metadata));
        }
        continue;
      }

      // 检查是否需要开始新块
      if (currentChunk && currentChunk.length + trimmed.length > this.config.maxChunkSize) {
        chunks.push(this.createChunk(currentChunk, documentId, chunkIndex++, metadata));
        currentChunk = trimmed + '\n\n';
      } else {
        currentChunk += (currentChunk ? '' : '') + trimmed + '\n\n';
      }
    }

    // 保存最后一个块
    if (currentChunk.trim()) {
      chunks.push(this.createChunk(currentChunk.trim(), documentId, chunkIndex++, metadata));
    }

    return chunks;
  }

  /**
   * 按固定大小分割文本
   */
  private chunkBySize(
    text: string,
    documentId: string,
    metadata: { fileName: string; fileType: string }
  ): TextChunk[] {
    const chunks: TextChunk[] = [];
    const overlap = this.config.chunkOverlap;

    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(
        startIndex + this.config.maxChunkSize,
        text.length
      );

      const chunkText = text.substring(startIndex, endIndex);

      // 跳过太小的块（最后一个除外）
      if (chunkText.length >= this.config.minChunkSize || endIndex >= text.length) {
        chunks.push(this.createChunk(chunkText, documentId, chunkIndex++, metadata));
      }

      startIndex = endIndex - overlap;
    }

    return chunks;
  }

  /**
   * 分割过大的文本
   */
  private splitLargeText(text: string): string[] {
    const chunks: string[] = [];
    const size = this.config.maxChunkSize;
    const overlap = this.config.chunkOverlap;

    for (let i = 0; i < text.length; i += (size - overlap)) {
      chunks.push(text.substring(i, i + size));
    }

    return chunks;
  }

  /**
   * 创建文本块对象
   */
  private createChunk(
    content: string,
    documentId: string,
    index: number,
    metadata: { fileName: string; fileType: string }
  ): TextChunk {
    return {
      id: `${documentId}-${index}`,
      documentId,
      content,
      index,
      metadata: {
        fileName: metadata.fileName,
        fileType: metadata.fileType,
        chunkSize: content.length,
        createdAt: new Date()
      }
    };
  }

  /**
   * 统计文本块信息
   */
  getChunkStats(chunks: TextChunk[]): {
    total: number;
    totalSize: number;
    avgSize: number;
    minSize: number;
    maxSize: number;
  } {
    if (chunks.length === 0) {
      return { total: 0, totalSize: 0, avgSize: 0, minSize: 0, maxSize: 0 };
    }

    const sizes = chunks.map(c => c.metadata.chunkSize);
    const totalSize = sizes.reduce((sum, size) => sum + size, 0);

    return {
      total: chunks.length,
      totalSize,
      avgSize: Math.round(totalSize / chunks.length),
      minSize: Math.min(...sizes),
      maxSize: Math.max(...sizes)
    };
  }
}

export default ChunkService;
