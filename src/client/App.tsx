/**
 * 应用主组件
 * 集成流式对话和数字人说话功能
 */
import { useEffect, useState, useRef } from 'react';
import { useKeyStore } from './store/keyStore';
import { useChatStore } from './store/chatStore';
import { useAvatarStore } from './store/avatarStore';
import { useKnowledgeStore } from './store/knowledgeStore';
import { useTicketStore } from './store/ticketStore';
import type { AvatarController } from './components/Avatar/AvatarController';
import AvatarContainer from './components/Avatar/AvatarContainer';
import ChatBox from './components/Chat/ChatBox';
import ChatInput from './components/Chat/ChatInput';
import QuickActions from './components/Chat/QuickActions';
import KeyInputModal from './components/Common/KeyInputModal';
import { KnowledgeManager } from './components/Knowledge';
import TicketList from './components/Ticket/TicketList';
import type { ChatMessage } from '@shared/types';
import type { KnowledgeSource } from './services/chatService';

function App() {
  const apiKeys = useKeyStore(state => state.apiKeys);
  const hasKeys = useKeyStore(state => state.hasKeys);
  const {
    messages,
    addMessage,
    currentResponse,
    setCurrentResponse,
    setCurrentSources,
    appendCurrentResponse,
    setProcessing,
    isProcessing,
    currentSources
  } = useChatStore();
  const { state: avatarState } = useAvatarStore();
  const { fetchDocuments } = useKnowledgeStore();
  const { addTicket } = useTicketStore();
  const controllerRef = useRef<AvatarController | null>(null);

  // 初始状态：如果没有密钥则显示弹窗，有密钥则不显示
  const [showKeyModal, setShowKeyModal] = useState(!hasKeys());
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge' | 'tickets'>('chat');
  const hasFetchedKnowledge = useRef(false);

  // 应用启动时自动获取知识库状态（后端已从持久化恢复）
  useEffect(() => {
    if (!hasFetchedKnowledge.current) {
      hasFetchedKnowledge.current = true;
      fetchDocuments().then(() => {
        console.log('[App] Knowledge synced from backend');
      }).catch(err => {
        console.warn('[App] Failed to sync knowledge:', err);
      });
    }
  }, [fetchDocuments]);

  /**
   * 发送消息 - 核心整合逻辑
   * 支持 UI 流式展示和数字人流式说话
   */
  const handleSendMessage = async (content: string, image?: string) => {
    // 1. 添加用户消息
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      image,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    // 2. 设置处理状态
    setProcessing(true);
    setCurrentResponse('');
    setCurrentSources([]);

    // 3. 获取会话信息
    const sessionId = useChatStore.getState().sessionId;
    const modelScopeKey = useKeyStore.getState().getModelScopeKey();
    const history = useChatStore.getState().getConversationHistory();

    // 4. 流式说话状态追踪
    let isFirstChunk = true;       // 标记是否第一段
    let speakingBuffer = '';        // 数字人说话缓冲区

    try {
      // 5. 调用流式对话服务
      const { sendMessageStream } = await import('./services/chatService');

      await sendMessageStream(
        {
          message: content,
          sessionId,
          conversationHistory: history,
          apiKeys: {
            modelScopeApiKey: modelScopeKey
          }
        },

        // ==================== onChunk: 每收到文本块 ====================
        (chunk: string) => {
          console.log('[App] 收到流式内容:', chunk);

          // 1. 更新 UI 显示
          appendCurrentResponse(chunk);

          // 2. 数字人说话 - 智能分段策略
          if (controllerRef.current) {
            speakingBuffer += chunk;

            // 分段条件：
            // - 累积长度 >= 10 字符
            // - 或遇到标点符号
            if (speakingBuffer.length >= 10 || /[。！？，、；：.!?,:;]/.test(chunk)) {
              controllerRef.current.speakStream(
                speakingBuffer,      // 文本片段
                isFirstChunk,        // 首段标记
                false                // 非结束
              );
              speakingBuffer = '';
              isFirstChunk = false;
            }
          }
        },

        // ==================== onSources: 收到知识库引用 ====================
        (sources: KnowledgeSource[]) => {
          console.log('[App] 收到知识库引用:', sources.length);
          setCurrentSources(sources);
        },

        // ==================== onTicket: 收到工单事件 ====================
        (ticket: any) => {
          console.log('[App] 自动创建工单:', ticket);
          // 添加到 store
          addTicket(ticket);
          // 存储当前工单，在 onComplete 时添加到消息
          (useChatStore.getState() as any).setCurrentTicket(ticket);
          // 显示通知（可选：可以使用 toast 库）
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('工单已创建', {
              body: `工单 #${ticket.id}: ${ticket.title}`,
              icon: '/ticket-icon.png'
            });
          }
        },

        // ==================== onComplete: 流式完成 ====================
        () => {
          console.log('[App] 流式对话完成');

          // 发送剩余内容给数字人
          if (controllerRef.current && speakingBuffer) {
            controllerRef.current.speakStream(speakingBuffer, isFirstChunk, true);
            speakingBuffer = '';
          } else if (controllerRef.current) {
            // 没有剩余内容，直接结束流
            controllerRef.current.speakStream('', false, true);
          }

          // 保存到历史消息
          const finalResponse = useChatStore.getState().currentResponse;
          const finalSources = useChatStore.getState().currentSources;
          const finalTicket = (useChatStore.getState() as any).currentTicket;

          addMessage({
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: finalResponse,
            timestamp: new Date(),
            sources: finalSources,
            ticket: finalTicket
          });

          // 清理状态
          setCurrentResponse('');
          setCurrentSources([]);
          (useChatStore.setState as any)({ currentTicket: undefined });
          setProcessing(false);
        },

        // ==================== onError: 错误处理 ====================
        (error: string) => {
          console.error('[App] 流式对话错误:', error);
          addMessage({
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `抱歉，我遇到了一些问题：${error}`,
            timestamp: new Date()
          });
          setCurrentResponse('');
          setCurrentSources([]);
          setProcessing(false);
        }
      );
    } catch (error: any) {
      console.error('[App] handleSendMessage 异常:', error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `发送消息失败：${error.message || '未知错误'}`,
        timestamp: new Date()
      });
      setProcessing(false);
    }
  };

  const handleQuickAction = (question: string) => {
    handleSendMessage(question);
  };

  const tabs = [
    { id: 'chat', label: '对话', icon: '💬' },
    { id: 'knowledge', label: '知识库', icon: '📚' },
    { id: 'tickets', label: '工单', icon: '🎫' },
  ] as const;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header - 现代化设计 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {/* Logo - 重新设计 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative w-11 h-11 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg border border-slate-700/50">
              <span className="text-2xl">🤖</span>
            </div>
          </div>

          {/* 品牌信息 */}
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
              企业智能助手
            </h1>
            <p className="text-xs text-slate-500 font-medium">HR 政策 · IT 支持 · 7×24 在线</p>
          </div>
        </div>

        {/* 顶部操作按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyModal(true)}
            className="group flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">设置</span>
          </button>
          <button
            onClick={() => useChatStore.getState().clearMessages()}
            className="group flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">清空</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Avatar */}
        <aside className="w-1/3 min-w-[320px] max-w-[450px] bg-white/60 backdrop-blur-md border-r border-slate-200/50 flex flex-col">
          {/* 数字人区域 */}
          <div className="p-4 border-b border-slate-200/50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                数字员工
              </h2>
              {avatarState === 'connected' && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  在线
                </span>
              )}
            </div>
            <AvatarContainer controllerRef={controllerRef} />
          </div>

          {/* Tab Navigation - 卡片式设计 */}
          <nav className="p-3 grid grid-cols-3 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex flex-row items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/50 hover:bg-white text-slate-600 hover:text-slate-800 border border-slate-200'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'chat' && (
              <QuickActions onAction={handleQuickAction} />
            )}
            {activeTab === 'knowledge' && (
              <KnowledgeManager />
            )}
            {activeTab === 'tickets' && (
              <TicketList />
            )}
          </div>

          {/* 侧边栏底部信息 */}
          <div className="p-4 border-t border-slate-200/50">
            <div className="text-xs text-slate-500 space-y-1">
              <p className="flex items-center gap-2">
                <span>💡</span>
                <span>未连接时不消耗积分</span>
              </p>
              <p className="flex items-center gap-2">
                <span>🔒</span>
                <span>密钥仅存储在本地</span>
              </p>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
          {/* Avatar Status Banner - 状态提示（不影响使用） */}
          {avatarState === 'connecting' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200/50 px-4 py-2.5 text-sm text-blue-800 text-center">
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在连接数字人...
              </span>
            </div>
          )}
          {avatarState === 'error' && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200/50 px-4 py-2.5 text-sm text-red-800 text-center">
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                数字人连接失败，请检查密钥配置
              </span>
            </div>
          )}
          {avatarState === 'connected' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200/50 px-4 py-2.5 text-sm text-green-800 text-center">
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                数字人已连接，回复时将语音播报
              </span>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <ChatBox
              messages={messages}
              currentResponse={currentResponse}
              isProcessing={isProcessing}
              currentSources={currentSources}
            />
          </div>

          {/* Chat Input */}
          <div className="border-t border-slate-200 bg-white p-4">
            <ChatInput onSend={handleSendMessage} disabled={false} />
          </div>
        </main>
      </div>

      {/* Key Input Modal */}
      <KeyInputModal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} />
    </div>
  );
}

export default App;
