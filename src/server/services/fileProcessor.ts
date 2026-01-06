/**
 * 文件处理服务
 * 支持 TXT、MD、PDF、DOCX 格式
 */

import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export class FileProcessor {
  /**
   * 从文件中提取文本内容
   * @param filePath 文件路径
   * @returns 提取的文本内容
   */
  async extractText(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.txt':
      case '.md':
        return this.extractFromTextFile(filePath);
      case '.pdf':
        return await this.extractFromPDF(filePath);
      case '.docx':
        return await this.extractFromDocx(filePath);
      default:
        throw new Error(`不支持的文件格式: ${ext}`);
    }
  }

  /**
   * 从文本文件提取内容
   */
  private extractFromTextFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }

  /**
   * 从 PDF 文件提取文本
   */
  private async extractFromPDF(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  /**
   * 从 DOCX 文件提取文本
   */
  private async extractFromDocx(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  /**
   * 验证文件是否支持
   */
  isSupported(filePath: string): boolean {
    const supportedExts = ['.txt', '.md', '.pdf', '.docx'];
    const ext = path.extname(filePath).toLowerCase();
    return supportedExts.includes(ext);
  }

  /**
   * 获取文件类型
   */
  getFileType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const types: Record<string, string> = {
      '.txt': 'text',
      '.md': 'markdown',
      '.pdf': 'pdf',
      '.docx': 'word'
    };
    return types[ext] || 'unknown';
  }
}

export default FileProcessor;
