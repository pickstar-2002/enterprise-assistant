/**
 * 对话框组件
 * 支持富文本展示、流式响应和知识库引用
 */
import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, Ticket } from '@shared/types';
import type { KnowledgeSource } from '../../services/chatService';

interface ChatBoxProps {
  messages: ChatMessage[];
  currentResponse?: string; // 当前流式响应
  isProcessing?: boolean;   // 是否正在处理
  currentSources?: KnowledgeSource[]; // 当前知识库引用
}

export default function ChatBox({
  messages,
  currentResponse = '',
  isProcessing = false,
  currentSources = []
}: ChatBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  if (messages.length === 0 && !currentResponse) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-400">
          <p className="text-5xl mb-4">👋</p>
          <p className="text-lg font-medium">您好！我是企业智能助手</p>
          <p className="text-sm mt-2">我可以帮您解答 HR 政策和 IT 技术问题</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4 pb-4 overflow-y-auto h-full">
      {/* 历史消息 */}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
        />
      ))}

      {/* 当前流式响应 + 打字机光标动画 */}
      {currentResponse && (
        <StreamingMessage
          content={currentResponse}
          sources={currentSources}
        />
      )}

      {/* 加载动画 */}
      {isProcessing && !currentResponse && (
        <LoadingIndicator />
      )}

      <div ref={endRef} />
    </div>
  );
}

/**
 * 消息气泡组件
 */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const timeStr = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              我
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              AI
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`message-bubble px-4 py-2.5 ${
              isUser ? 'message-user' : 'message-assistant'
            }`}
          >
            {message.image && (
              <div className="mb-2">
                <img
                  src={message.image}
                  alt="上传的图片"
                  className="max-w-full rounded-lg max-h-64 object-contain"
                />
              </div>
            )}
            {/* 富文本内容 */}
            <div className="whitespace-pre-wrap break-words">
              {formatContent(message.content)}
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-1">{timeStr}</span>

          {/* 知识库引用 */}
          {message.sources && message.sources.length > 0 && (
            <KnowledgeSources sources={message.sources} />
          )}

          {/* 工单通知 */}
          {message.ticket && (
            <TicketNotification ticket={message.ticket} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 流式消息组件（带打字机效果）
 */
function StreamingMessage({ content, sources }: { content: string; sources: KnowledgeSource[] }) {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex gap-3 max-w-[80%]">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            AI
          </div>
        </div>

        {/* Message Content */}
        <div className="flex flex-col items-start">
          <div className="message-bubble px-4 py-2.5 message-assistant">
            {/* 富文本内容 + 闪烁光标 */}
            <div className="whitespace-pre-wrap break-words">
              {formatContent(content)}
              {/* 闪烁光标 */}
              <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle" />
            </div>
          </div>

          {/* 知识库引用 */}
          {sources && sources.length > 0 && (
            <KnowledgeSources sources={sources} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 加载指示器组件
 */
function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            AI
          </div>
        </div>
        <div className="message-bubble px-4 py-2.5 message-assistant">
          <div className="flex space-x-1.5">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 知识库引用组件 - 富文本展示
 */
function KnowledgeSources({ sources }: { sources: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!sources || sources.length === 0) return null;

  // 去重：根据 filename + chunkIndex + content 的前100个字符去重
  const deduplicatedSources = sources.filter((source, index, self) => {
    const key = `${source.metadata?.filename}-${source.metadata?.chunkIndex}-${source.content?.slice(0, 100)}`;
    return self.findIndex(s =>
      `${s.metadata?.filename}-${s.metadata?.chunkIndex}-${s.content?.slice(0, 100)}` === key
    ) === index;
  });

  // 分类图标映射
  const categoryIcons: Record<string, string> = {
    hr: '👤',
    it: '💻',
    general: '📄'
  };

  // 获取相似度等级颜色
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.7) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  // 格式化引用内容（完全转换为富文本，移除所有 Markdown 符号）
  const formatSourceContent = (content: string) => {
    let formatted = content;

    // 1. 先处理内联格式（粗体、斜体、代码）
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>');
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-600">$1</em>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-100 rounded text-sm font-mono text-red-600">$1</code>');

    // 2. 按行处理
    const lines = formatted.split('\n');
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (!line) {
        // 空行
        if (result.length > 0 && result[result.length - 1] !== '</p><p class="mt-2 mb-1">') {
          result.push('</p><p class="mt-2 mb-1">');
        }
        continue;
      }

      // 处理标题 ### 标题
      if (line.startsWith('###')) {
        const titleText = line.replace(/^###\s+/, '').trim();
        result.push(`<strong class="text-xs font-bold text-slate-800 block mb-1 mt-2">${titleText}</strong>`);
        continue;
      }

      // 处理二级标题 ## 标题
      if (line.startsWith('##')) {
        const titleText = line.replace(/^##\s+/, '').trim();
        result.push(`<strong class="text-sm font-bold text-slate-800 block mb-1 mt-2">${titleText}</strong>`);
        continue;
      }

      // 处理列表项 - 项目
      if (line.startsWith('-')) {
        const itemText = line.replace(/^-\s+/, '').trim();
        result.push(`<div class="flex items-start gap-2 my-0.5"><span class="text-blue-500 flex-shrink-0">•</span><span class="text-slate-700">${itemText}</span></div>`);
        continue;
      }

      // 普通段落
      result.push(`<span class="text-slate-700">${line}</span>`);
    }

    return result.join('<br />');
  };

  return (
    <div className="mt-3 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800 overflow-hidden shadow-sm">
      {/* 标题栏 - 可点击收缩/展开 */}
      <div
        className="px-3 py-2 bg-gradient-to-r from-blue-100/50 to-indigo-100/50 dark:from-blue-800/30 dark:to-indigo-800/30 border-b border-blue-100 dark:border-blue-800 cursor-pointer hover:bg-blue-100/70 dark:hover:bg-blue-800/40 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">📚</span>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              知识库引用
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-200/50 dark:bg-blue-700/50 text-blue-700 dark:text-blue-300 text-xs font-medium">
              {deduplicatedSources.length}
            </span>
          </div>
          {/* 收缩/展开箭头 */}
          <svg
            className={`w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform ${
              isCollapsed ? 'rotate-0' : 'rotate-180'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 引用列表 - 可收缩 */}
      {!isCollapsed && (
        <div className="p-2 space-y-1.5 max-h-64 overflow-y-auto">
        {deduplicatedSources.slice(0, 5).map((source, index) => {
          const isExpanded = expandedId === `${index}`;
          const scorePercent = (source.score * 100);
          const scoreClass = getScoreColor(source.score);
          const category = source.metadata?.category || 'general';
          const icon = categoryIcons[category] || categoryIcons.general;

          return (
            <div
              key={index}
              className="group rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/60 hover:border-blue-200 dark:hover:border-blue-700/60 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : `${index}`)}
            >
              {/* 引用头部 - 始终显示 */}
              <div className="p-2">
                <div className="flex items-start gap-2">
                  {/* 序号和图标 */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs">{icon}</span>
                  </div>

                  {/* 内容预览 */}
                  <div className="flex-1 min-w-0">
                    {/* 文件名和相似度 */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        {source.metadata?.filename || '未知文档'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${scoreClass} border`}>
                        {scorePercent.toFixed(0)}%
                      </span>
                    </div>

                    {/* 内容摘要 - 完整显示，不做截断 */}
                    <div
                      className="text-xs text-slate-600 dark:text-slate-400 max-h-32 overflow-y-auto"
                      dangerouslySetInnerHTML={{
                        __html: formatSourceContent(source.content || '')
                      }}
                    />

                    {/* 元数据标签 */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs">
                        Chunk #{source.metadata?.chunkIndex || 0}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase">
                        {category}
                      </span>
                    </div>
                  </div>

                  {/* 展开箭头 */}
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 展开后的完整内容 */}
              {isExpanded && (
                <div className="px-2 pb-2 border-t border-slate-100 dark:border-slate-700/50 mt-1 pt-2">
                  <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatSourceContent(source.content || '')
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {/* 更多提示 */}
        {deduplicatedSources.length > 5 && (
          <div className="px-3 py-1.5 bg-blue-50/50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800/50 text-center">
            <span className="text-xs text-blue-600 dark:text-blue-400">
              还有 {deduplicatedSources.length - 5} 条引用...
            </span>
          </div>
        )}
        </div>
      )}
    </div>
  );
}

/**
 * 富文本格式化 - 支持 **粗体** 等标记
 * @param content 文本内容
 * @returns 格式化后的 JSX 元素数组
 */
function formatContent(content: string) {
  return content
    .split('\n')
    .map((line, i) => {
      // 将 **文本** 转换为 <strong> 标签
      let formattedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // 将 *文本* 转换为 <em> 标签（可选）
      formattedLine = formattedLine.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      return (
        <p
          key={i}
          dangerouslySetInnerHTML={{
            __html: formattedLine || '&nbsp;'
          }}
          className="my-1"
        />
      );
    });
}

/**
 * 工单通知组件 - 显示自动创建的工单
 */
function TicketNotification({ ticket }: { ticket: Ticket }) {
  // 优先级配置
  const PRIORITY_CONFIG: Record<Ticket['priority'], { label: string; color: string }> = {
    low: { label: '低', color: 'bg-gray-200 text-gray-600' },
    medium: { label: '中', color: 'bg-blue-100 text-blue-700' },
    high: { label: '高', color: 'bg-orange-100 text-orange-700' },
    urgent: { label: '紧急', color: 'bg-red-100 text-red-700' },
  };

  // 分类配置
  const CATEGORY_CONFIG: Record<Ticket['category'], { label: string; icon: string }> = {
    hr: { label: 'HR', icon: '👤' },
    it: { label: 'IT', icon: '💻' },
  };

  const priorityInfo = PRIORITY_CONFIG[ticket.priority];
  const categoryInfo = CATEGORY_CONFIG[ticket.category];

  return (
    <div className="mt-3 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden shadow-sm animate-fade-in">
      {/* 标题栏 */}
      <div className="px-3 py-2 bg-gradient-to-r from-green-100/50 to-emerald-100/50 border-b border-green-200">
        <div className="flex items-center gap-2">
          <span className="text-sm">🎫</span>
          <span className="text-xs font-semibold text-green-700">
            工单已自动创建
          </span>
        </div>
      </div>

      {/* 工单信息 */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
              <span className="text-sm font-medium text-gray-900">{ticket.title}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded ${priorityInfo.color}`}>
                {priorityInfo.label}优先级
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <span>{categoryInfo.icon}</span>
                <span>{categoryInfo.label}</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              // 切换到工单标签页
              const tabs = document.querySelectorAll('[role="tab"]');
              tabs.forEach(tab => {
                if (tab.textContent?.includes('工单')) {
                  (tab as HTMLElement).click();
                }
              });
            }}
            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
          >
            查看详情
          </button>
        </div>
        <div className="text-xs text-gray-600 bg-white/50 rounded-lg p-2 border border-gray-200">
          {ticket.description}
        </div>
      </div>
    </div>
  );
}
