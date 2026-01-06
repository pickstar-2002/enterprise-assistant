/**
 * 对话路由
 * 支持 SSE 流式响应和 RAG 知识库检索
 */
import { Router, Request, Response } from 'express';
import chatService from '../services/chatService.js';

const router = Router();

// POST /api/chat/stream - SSE streaming chat with RAG
router.post('/stream', async (req: Request, res: Response) => {
  const { message, sessionId, conversationHistory, apiKeys, enableRAG } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲

  try {
    const stream = chatService.processChatStream({
      message,
      sessionId: sessionId || crypto.randomUUID(),
      conversationHistory,
      apiKeys,
      enableRAG: enableRAG !== false // 默认启用 RAG
    });

    let sourcesSent = false;

    for await (const result of stream) {
      if (typeof result === 'string') {
        // 文本内容
        res.write(`data: ${JSON.stringify({ type: 'content', data: result })}\n\n`);
      } else if ('type' in result && result.type === 'ticket') {
        // 工单事件
        res.write(`data: ${JSON.stringify({ type: 'ticket', data: result.data })}\n\n`);
      } else {
        // 知识库引用
        if (!sourcesSent) {
          res.write(`data: ${JSON.stringify({ type: 'sources', data: result })}\n\n`);
          sourcesSent = true;
        }
      }
    }

    // 发送结束标记
    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('[Chat Route] Error:', error);
    res.write(
      `data: ${JSON.stringify({
        type: 'error',
        data: error.message || '抱歉，我遇到了一些问题，请稍后再试。'
      })}\n\n`
    );
    res.end();
  }
});

// POST /api/chat/image - Image understanding chat
router.post('/image', async (req: Request, res: Response) => {
  const { imageUrl, question, apiKeys } = req.body;

  if (!imageUrl || !question) {
    return res.status(400).json({ error: 'imageUrl and question are required' });
  }

  try {
    const apiKey = apiKeys?.modelscopeApiKey || 'ms-de3c153b-5a19-41d1-bd3e-257a7eef7922';
    const response = await chatService.chatWithImage(imageUrl, question, apiKey);

    res.json({ success: true, response });
  } catch (error: any) {
    console.error('[Chat Route] Image error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '图片理解失败'
    });
  }
});

export default router;
