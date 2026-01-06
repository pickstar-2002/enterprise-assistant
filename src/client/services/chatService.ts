/**
 * 前端对话服务
 * 处理与后端的 SSE 流式通信
 */
import type { ChatRequest, ChatStreamResponse } from '@shared/types';

const API_BASE = '/api';

/**
 * SSE 流式响应数据类型
 */
export interface SSEData {
  type: 'content' | 'sources' | 'ticket' | 'end' | 'error';
  data: string | KnowledgeSource[] | any | null;
}

/**
 * 知识库来源信息
 */
export interface KnowledgeSource {
  content: string;
  score: number;
  metadata: {
    filename: string;
    chunkIndex: number;
    category?: string;
  };
}

/**
 * 流式发送对话消息（SSE）
 * @param request 对话请求
 * @param onChunk 每收到一个文本块触发
 * @param onSources 收到知识库引用时触发
 * @param onTicket 收到工单时触发
 * @param onComplete 完成时触发
 * @param onError 错误时触发
 */
export async function sendMessageStream(
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onSources: (sources: KnowledgeSource[]) => void,
  onTicket: (ticket: any) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() && line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed: SSEData = JSON.parse(data);

            if (parsed.type === 'content') {
              onChunk(parsed.data as string);
            } else if (parsed.type === 'sources') {
              onSources(parsed.data as KnowledgeSource[]);
            } else if (parsed.type === 'ticket') {
              onTicket(parsed.data);
            } else if (parsed.type === 'end') {
              onComplete();
              return;
            } else if (parsed.type === 'error') {
              onError(parsed.data as string);
              return;
            }
          } catch (e) {
            console.warn('[chatService] Failed to parse SSE data:', data);
          }
        }
      }
    }
  } catch (error: any) {
    console.error('[chatService] Stream error:', error);
    onError(error.message || '网络错误，请检查连接');
  }
}

/**
 * 发送消息（兼容旧接口）
 * @param message 消息内容
 * @param sessionId 会话ID
 * @param image 图片URL（可选）
 * @returns 异步生成器
 */
export async function* streamChat(
  request: ChatRequest
): AsyncGenerator<ChatStreamResponse> {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No reader available');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(5);
        if (data === '[DONE]') {
          yield { content: '', done: true };
          return;
        }
        try {
          const parsed: SSEData = JSON.parse(data);
          if (parsed.type === 'content') {
            yield { content: parsed.data as string, done: false };
          }
        } catch (e) {
          console.warn('Failed to parse SSE data:', data);
        }
      }
    }
  }
}

/**
 * 发送消息（简化版）
 * @param message 消息内容
 * @param sessionId 会话ID
 * @param image 图片URL（可选）
 * @returns 异步生成器
 */
export async function sendMessage(
  message: string,
  sessionId: string,
  image?: string
) {
  const { useKeyStore } = await import('../store/keyStore');
  const { useChatStore } = await import('../store/chatStore');

  const modelScopeKey = useKeyStore.getState().getModelScopeKey();
  const conversationHistory = useChatStore.getState().messages;

  const request: ChatRequest = {
    message,
    sessionId,
    image,
    conversationHistory,
    apiKeys: {
      modelScopeApiKey: modelScopeKey,
    },
  };

  return streamChat(request);
}

/**
 * 图片理解对话
 * @param imageUrl 图片URL
 * @param question 问题
 * @returns Promise<响应内容>
 */
export async function chatWithImage(imageUrl: string, question: string): Promise<string> {
  const { useKeyStore } = await import('../store/keyStore');
  const modelScopeKey = useKeyStore.getState().getModelScopeKey();

  const response = await fetch(`${API_BASE}/chat/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl,
      question,
      apiKeys: {
        modelscopeApiKey: modelScopeKey
      }
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

export default {
  sendMessageStream,
  streamChat,
  sendMessage,
  chatWithImage
};
