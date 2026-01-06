/**
 * 对话服务
 * 集成 RAG 检索和流式响应
 */
import ModelScopeService, { ChatMessage } from './modelscopeService.js';
import ragService, { VectorSearchResult } from './ragService.js';
import ticketService from './ticketService.js';
import type { Ticket } from '@shared/types';

export interface ChatRequest {
  message: string;
  sessionId: string;
  conversationHistory?: Array<{ role: string; content: string | any[] }>;
  apiKeys?: {
    modelScopeApiKey?: string;
  };
  enableRAG?: boolean;
}

/**
 * 企业智能助手系统 Prompt
 */
const SYSTEM_PROMPT = `你是企业智能助手，专注于 HR 政策解答和 IT 技术支持。

你的职责：
1. 为企业员工提供 HR 政策咨询服务（薪资福利、考勤休假、招聘入职、培训发展、离职退休等）
2. 为企业员工提供 IT 技术支持（硬件故障、软件问题、网络问题、账号权限等）
3. 保持友好、专业的态度
4. 回答要简洁明了，重点突出

重要原则：
- 优先使用提供的知识库内容回答
- 如果知识库中没有相关信息，可以基于通用知识回答
- 不确定的情况下明确说明
- 保持回答的专业性和准确性

请用友好、专业的语言进行回答，让用户感到满意。`;

/**
 * 对话服务类
 */
export class ChatService {
  /**
   * 检测是否需要创建工单
   */
  private detectTicketNeeded(message: string): { needed: boolean; category: Ticket['category']; priority: Ticket['priority'] } | null {
    const lowerMessage = message.toLowerCase();

    // IT 故障关键词 - 需要人工处理
    const itKeywords = [
      '坏了', '故障', '无法连接', '连不上', '断网', '网络断',
      '蓝屏', '死机', '崩溃', '卡死', '卡顿',
      '打不开', '启动不了', '安装失败', '卸载不了',
      '忘记密码', '密码错误', '账号锁定', '无法登录',
      '打印机', '投影仪', '扫描仪', '设备故障',
      '无法访问', '访问不了', '权限问题', '没有权限'
    ];

    // HR 咨询关键词 - 可能需要跟进
    const hrKeywords = [
      '申请', '报销', '请假', '离职', '入职',
      '工资条', '薪资问题', '社保问题', '公积金问题'
    ];

    // 检查 IT 问题
    const itScore = itKeywords.filter(k => lowerMessage.includes(k)).length;
    if (itScore > 0) {
      // 根据关键词数量判断优先级
      let priority: Ticket['priority'] = 'medium';
      if (lowerMessage.includes('紧急') || lowerMessage.includes('完全') || lowerMessage.includes('无法工作')) {
        priority = 'urgent';
      } else if (itScore >= 2 || lowerMessage.includes('蓝屏') || lowerMessage.includes('崩溃')) {
        priority = 'high';
      }
      return { needed: true, category: 'it', priority };
    }

    // 检查 HR 问题
    const hrScore = hrKeywords.filter(k => lowerMessage.includes(k)).length;
    if (hrScore > 0) {
      let priority: Ticket['priority'] = 'low';
      if (lowerMessage.includes('急') || lowerMessage.includes('尽快')) {
        priority = 'medium';
      }
      return { needed: true, category: 'hr', priority };
    }

    return null;
  }

  /**
   * 从消息中提取工单标题和描述
   */
  private extractTicketInfo(message: string): { title: string; description: string } {
    // 取前30个字符作为标题
    const title = message.length > 30 ? message.slice(0, 30) + '...' : message;
    return { title, description: message };
  }

  /**
   * 流式处理对话（带 RAG）
   * @param request 对话请求
   * @returns 异步生成器，可生成知识库引用、工单或文本块
   */
  async *processChatStream(request: ChatRequest): AsyncGenerator<string | VectorSearchResult[] | { type: 'ticket'; data: Ticket }> {
    const {
      message,
      conversationHistory = [],
      apiKeys,
      enableRAG = true
    } = request;

    const apiKey = apiKeys?.modelScopeApiKey || 'ms-de3c153b-5a19-41d1-bd3e-257a7eef7922';

    // 0. 检测是否需要创建工单（在 AI 回复前）
    const ticketDetection = this.detectTicketNeeded(message);
    let createdTicket: Ticket | undefined;
    if (ticketDetection?.needed) {
      const { title, description } = this.extractTicketInfo(message);
      createdTicket = ticketService.create({
        title,
        description,
        category: ticketDetection.category,
        priority: ticketDetection.priority,
      });
      console.log('[ChatService] 自动创建工单:', createdTicket.id, createdTicket.title);
      // 先发送工单事件
      yield { type: 'ticket', data: createdTicket };
    }

    // 初始化 AI 服务
    const aiService = new ModelScopeService(apiKey);
    ragService.setModelScopeService(aiService);

    // 1. 如果启用 RAG，检索相关知识
    let sources: VectorSearchResult[] = [];
    if (enableRAG) {
      console.log('[ChatService] 开始RAG检索，问题:', message);
      sources = await ragService.retrieveDocuments(message, 5, 0.5);
      console.log('[ChatService] 检索到知识库引用数量:', sources.length);
    }

    // 2. 构建消息列表
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // 3. 如果有检索结果，添加到上下文
    if (sources.length > 0) {
      let ragContext = '\n\n参考知识库内容：\n\n';
      sources.forEach((doc, index) => {
        ragContext += `[${index + 1}] ${doc.content}\n`;
        ragContext += `(相似度: ${(doc.score * 100).toFixed(1)}% | 来源: ${doc.metadata.filename})\n\n`;
      });
      messages[0].content += ragContext;
    }

    // 4. 添加对话历史（只保留最近10条）
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      });
    }

    // 5. 添加当前问题
    messages.push({ role: 'user', content: message });

    // 6. 先返回知识库引用
    if (sources.length > 0) {
      yield sources;
    }

    // 7. 流式生成回复
    try {
      const stream = aiService.chatStream(messages);
      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      console.error('[ChatService] Stream error:', error);
      yield '抱歉，我遇到了一些问题，请稍后再试。';
    }
  }

  /**
   * 图片理解对话
   * @param imageUrl 图片 URL
   * @param question 问题
   * @param apiKey API 密钥
   * @returns AI 回复内容
   */
  async chatWithImage(imageUrl: string, question: string, apiKey: string): Promise<string> {
    const aiService = new ModelScopeService(apiKey);
    return await aiService.chatWithImage(imageUrl, question);
  }
}

// 为了保持向后兼容，保留旧的函数接口
const DEFAULT_API_KEY = 'ms-de3c153b-5a19-41d1-bd3e-257a7eef7922';
const MODELSCOPE_BASE_URL = process.env.MODELSCOPE_BASE_URL || 'https://api-inference.modelscope.cn/v1';
const MODELSCOPE_CHAT_MODEL = process.env.MODELSCOPE_CHAT_MODEL || 'Qwen/Qwen3-VL-235B-A22B-Instruct';
const MODELSCOPE_EMBEDDING_MODEL = process.env.MODELSCOPE_EMBEDDING_MODEL || 'Qwen/Qwen3-Embedding-8B';

/**
 * @deprecated 请使用 ChatService 类的 processChatStream 方法
 */
export async function* streamChat(
  message: string,
  sessionId: string,
  conversationHistory: any[] = [],
  apiKey?: string
): AsyncGenerator<{ content: string; done: boolean }> {
  const service = new ChatService();

  const generator = service.processChatStream({
    message,
    sessionId,
    conversationHistory,
    apiKeys: {
      modelScopeApiKey: apiKey || DEFAULT_API_KEY
    },
    enableRAG: true
  });

  let sources: VectorSearchResult[] = [];

  for await (const result of generator) {
    if (typeof result === 'string') {
      yield { content: result, done: false };
    } else {
      // 保存知识库引用
      sources = result;
    }
  }

  yield { content: '', done: true };
}

export default new ChatService();
