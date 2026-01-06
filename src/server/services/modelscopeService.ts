/**
 * 魔搭社区 AI 服务
 * 封装两个 AI 模型：
 * - Qwen3-Embedding-8B: 文本向量化（用于 RAG 检索）
 * - Qwen3-VL-235B-A22B-Instruct: 对话生成（支持多模态）
 */
import OpenAI from 'openai';

const MODELSCOPE_BASE_URL = process.env.MODELSCOPE_BASE_URL || 'https://api-inference.modelscope.cn/v1';
const MODELSCOPE_EMBEDDING_MODEL = process.env.MODELSCOPE_EMBEDDING_MODEL || 'Qwen/Qwen3-Embedding-8B';
const MODELSCOPE_CHAT_MODEL = process.env.MODELSCOPE_CHAT_MODEL || 'Qwen/Qwen3-VL-235B-A22B-Instruct';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export interface ChatStreamOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * 魔搭 AI 服务类
 * 使用 OpenAI 兼容 API 连接魔搭社区
 */
export class ModelScopeService {
  private client: OpenAI;
  private embeddingModel: string;
  private chatModel: string;

  constructor(apiKey: string) {
    // 使用 OpenAI 兼容 API 连接魔搭社区
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: MODELSCOPE_BASE_URL
    });
    this.embeddingModel = MODELSCOPE_EMBEDDING_MODEL;
    this.chatModel = MODELSCOPE_CHAT_MODEL;
  }

  /**
   * 生成文本向量（使用 Qwen3-Embedding-8B）
   * @param text 要向量化的文本
   * @returns 向量数组
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.embeddingModel,
        input: text,
        encoding_format: 'float'
      });

      // ModelScope API 返回 JSON 字符串，需要解析
      let parsedResponse = response;
      if (typeof response === 'string') {
        parsedResponse = JSON.parse(response);
      }

      return Array.from(parsedResponse.data[0].embedding);
    } catch (error: any) {
      console.error('[ModelScope] Embedding Error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || '向量化失败');
      }
      throw error;
    }
  }

  /**
   * 批量生成向量
   * @param texts 文本数组
   * @returns 向量二维数组
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }
    return embeddings;
  }

  /**
   * 普通对话（使用 Qwen3-VL-235B-A22B-Instruct）
   * @param messages 对话消息列表
   * @returns AI 回复内容
   */
  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.chatModel,
        messages: messages as any,
        stream: false
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('[ModelScope] Chat Error:', error);
      throw new Error('对话生成失败');
    }
  }

  /**
   * 流式对话
   * @param messages 对话消息列表
   * @returns 异步生成器，逐个生成文本块
   */
  async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.chatModel,
        messages: messages as any,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('[ModelScope] Stream Error:', error);
      throw new Error('流式对话失败');
    }
  }

  /**
   * 图片理解对话（多模态）
   * @param imageUrl 图片 URL
   * @param question 问题
   * @returns AI 回复内容
   */
  async chatWithImage(imageUrl: string, question: string): Promise<string> {
    const messages: ChatMessage[] = [{
      role: 'user',
      content: [
        { type: 'text', text: question },
        { type: 'image_url', image_url: { url: imageUrl } }
      ]
    }];

    return await this.chat(messages);
  }

  /**
   * 验证 API 密钥是否有效
   * 通过发送一个简单的测试请求来验证密钥
   * @returns true 如果密钥有效
   */
  async validateApiKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      console.log('[ModelScope] 开始验证密钥...');

      // 尝试生成一个简单的向量来验证密钥
      const response = await this.client.embeddings.create({
        model: this.embeddingModel,
        input: 'test',
        encoding_format: 'float'
      });

      console.log('[ModelScope] 开始验证密钥...');

      // ModelScope API 返回 JSON 字符串，需要解析
      let parsedResponse = response;
      if (typeof response === 'string') {
        try {
          parsedResponse = JSON.parse(response);
        } catch (e) {
          console.error('[ModelScope] JSON 解析失败:', e);
          return { valid: false, error: 'API 响应格式错误' };
        }
      }

      // 使用 OpenAI SDK 标准格式: response.data[0].embedding
      const data = (parsedResponse as any).data;
      if (!data || data.length === 0) {
        return { valid: false, error: 'API 未返回数据' };
      }

      const embedding = data[0]?.embedding;
      if (!embedding || !Array.isArray(embedding)) {
        return { valid: false, error: 'API 返回数据缺少向量字段' };
      }

      console.log('[ModelScope] 密钥验证成功，向量维度:', embedding.length);
      return { valid: true };
    } catch (error: any) {
      console.error('[ModelScope] Validate Key Error:', error);
      console.error('[ModelScope] Error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        response: error.response?.data
      });

      // 解析错误信息
      let errorMessage = '密钥验证失败';
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.error?.code) {
        errorMessage = `错误代码: ${error.response.data.error.code}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // 检查是否是认证错误
      if (error.status === 401 || errorMessage.includes('Invalid') || errorMessage.includes('authentication')) {
        errorMessage = 'API 密钥无效或已过期';
      } else if (error.status === 429) {
        errorMessage = 'API 调用频率超限，请稍后再试';
      } else if (error.status === 403) {
        errorMessage = 'API 访问被拒绝，请检查密钥权限';
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        errorMessage = '无法连接到 API 服务器，请检查网络';
      } else if (errorMessage.includes('connect')) {
        errorMessage = '网络连接失败';
      }

      return { valid: false, error: errorMessage };
    }
  }
}

export default ModelScopeService;
