/**
 * 数字人容器组件
 * 管理 SDK 加载、连接状态和控制器
 */
import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useAvatarStore } from '../../store/avatarStore';
import { useKeyStore } from '../../store/keyStore';
import { useChatStore } from '../../store/chatStore';
import { AvatarController } from './AvatarController';
import type { AvatarState } from '@shared/types';

export interface AvatarContainerRef {
  controller: AvatarController | null;
}

interface AvatarContainerProps {
  controllerRef?: React.RefObject<AvatarController | null>;
}

function AvatarContainer({ controllerRef }: AvatarContainerProps, ref: React.Ref<AvatarContainerRef>) {
  const localControllerRef = useRef<AvatarController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, setState, setSDKLoaded, setActionState, isSDKLoaded } = useAvatarStore();
  const { getXingyunAppId, getXingyunAppSecret, hasKeys } = useKeyStore();
  const { currentResponse, isProcessing } = useChatStore();

  // 使用连接序号作为 key，每次连接都重新创建容器
  const [connectionSeq, setConnectionSeq] = useState(0);
  const [containerId] = useState(() => `sdk-${crypto.randomUUID()}`);
  const [errorMessage, setErrorMessage] = useState('');
  const [sdkLoadError, setSdkLoadError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');

  // 向父组件暴露 controller
  useImperativeHandle(ref, () => ({
    controller: localControllerRef.current
  }));

  // 当 controller 变化时通知父组件
  useEffect(() => {
    if (controllerRef && typeof controllerRef === 'object') {
      (controllerRef as any).current = localControllerRef.current;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localControllerRef.current]); // 只依赖 localControllerRef.current

  useEffect(() => {
    // Check if SDK is already loaded
    if ((window as any).XmovAvatar) {
      setSDKLoaded(true);
      return;
    }

    // Load SDK script dynamically
    const script = document.createElement('script');
    script.src = 'https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar@latest.js';
    script.async = true;
    script.onload = () => {
      console.log('SDK loaded successfully');
      setSDKLoaded(true);
      setSdkLoadError(false);
    };
    script.onerror = () => {
      console.error('Failed to load SDK script');
      setSdkLoadError(true);
      setErrorMessage('SDK 加载失败，请检查网络连接');
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove the script as it might be used elsewhere
    };
  }, [setSDKLoaded]);

  const connect = async () => {
    setErrorMessage('');
    setLoadingProgress(0);
    setLoadingStage('正在初始化...');

    // Check if SDK is loaded
    if (!isSDKLoaded && !(window as any).XmovAvatar) {
      setErrorMessage('SDK 正在加载中，请稍后再试');
      return;
    }

    // Check if keys are configured
    if (!hasKeys()) {
      setErrorMessage('请先配置 API 密钥');
      setState('error');
      return;
    }

    const appId = getXingyunAppId();
    const appSecret = getXingyunAppSecret();

    if (!appId || !appSecret) {
      setErrorMessage('密钥配置不完整，请重新配置');
      setState('error');
      return;
    }

    // Validate key format
    if (appId.length !== 32) {
      setErrorMessage('App ID 格式错误（应为32位）');
      setState('error');
      return;
    }

    if (appSecret.length !== 32) {
      setErrorMessage('App Secret 格式错误（应为32位）');
      setState('error');
      return;
    }

    setState('connecting');

    try {
      // 每次连接都创建新的 controller
      localControllerRef.current = new AvatarController(containerId);

      console.log('Initializing avatar with App ID:', appId.substring(0, 8) + '...');

      await localControllerRef.current.init(appId, appSecret, (progress) => {
        setLoadingProgress(progress);
        if (progress < 30) {
          setLoadingStage('正在加载模型资源...');
        } else if (progress < 60) {
          setLoadingStage('正在加载音频资源...');
        } else if (progress < 90) {
          setLoadingStage('正在初始化引擎...');
        } else {
          setLoadingStage('即将完成...');
        }
      });

      if (localControllerRef.current.isReady()) {
        console.log('Avatar connected successfully');
        setState('connected');
        setActionState('idle');
        setErrorMessage('');
        setLoadingProgress(100);
        setLoadingStage('连接成功！');

        // 通知父组件 controller 已准备好
        if (controllerRef && typeof controllerRef === 'object') {
          (controllerRef as any).current = localControllerRef.current;
        }
      } else {
        setErrorMessage('SDK 初始化失败，请重试');
        setState('error');
      }
    } catch (error: any) {
      console.error('Failed to connect avatar:', error);
      const errorMsg = error?.message || '连接失败，请检查密钥是否正确';
      setErrorMessage(errorMsg);
      setState('error');
    }
  };

  const disconnect = () => {
    if (localControllerRef.current) {
      try {
        localControllerRef.current.destroy();
      } catch (error) {
        console.error('Error destroying controller:', error);
      }
      localControllerRef.current = null;

      // 通知父组件 controller 已清除
      if (controllerRef && typeof controllerRef === 'object') {
        (controllerRef as any).current = null;
      }
    }

    setState('offline');
    setActionState('idle');
    setErrorMessage('');
    setLoadingProgress(0);
    setLoadingStage('');

    // 增加 connectionSeq 强制 React 重新创建容器
    // 这样可以避免 SDK 和 React 的 DOM 操作冲突
    setConnectionSeq(prev => prev + 1);
  };

  const getStatusInfo = (state: AvatarState) => {
    switch (state) {
      case 'offline':
        return {
          text: '数字人未连接',
          color: 'text-slate-600',
          bgColor: 'bg-slate-100',
          icon: '🔌',
        };
      case 'connecting':
        return {
          text: '正在连接...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: '⏳',
        };
      case 'connected':
        return {
          text: '已连接',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '✅',
        };
      case 'error':
        return {
          text: '连接失败',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: '❌',
        };
    }
  };

  const statusInfo = getStatusInfo(state);

  // 富文本格式化函数 - 与 ChatBox 保持一致
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        // **粗体** → <strong>
        let formattedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>');
        // *斜体* → <em>
        formattedLine = formattedLine.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-600">$1</em>');
        // `代码` → <code>
        formattedLine = formattedLine.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-100 rounded text-sm font-mono text-red-600">$1</code>');

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
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Avatar Display */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[4/3]">
        {/* SDK 容器 - 完全不受 React 管理 */}
        <div
          key={connectionSeq}
          ref={containerRef}
          id={containerId}
          className="w-full h-full flex items-center justify-center"
          suppressHydrationWarning
        />

        {/* 状态覆盖层 - 完全独立的 div */}
        {state !== 'connected' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-slate-900/80">
            <div className="text-center text-slate-400 px-4">
              <p className="text-4xl mb-2">🤖</p>
              <p className="text-sm mb-3">
                {sdkLoadError && 'SDK 加载失败，请刷新页面重试'}
                {!isSDKLoaded && !sdkLoadError && '正在加载 SDK...'}
                {isSDKLoaded && state === 'offline' && '点击连接按钮启动数字人'}
                {isSDKLoaded && state === 'connecting' && loadingStage}
                {isSDKLoaded && state === 'error' && '连接失败'}
              </p>

              {/* Progress Bar */}
              {state === 'connecting' && loadingProgress > 0 && (
                <div className="w-full max-w-[200px] mx-auto">
                  <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{loadingProgress}%</p>
                </div>
              )}

              {/* Loading Spinner */}
              {state === 'connecting' && loadingProgress === 0 && (
                <div className="flex justify-center">
                  <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connection Status Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
          >
            <span>{statusInfo.icon}</span>
            <span>{statusInfo.text}</span>
          </span>
        </div>

        {/* SDK Load Status */}
        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isSDKLoaded ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <span>{isSDKLoaded ? '✓' : '⏳'}</span>
            <span>SDK</span>
          </span>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">⚠️ {errorMessage}</p>
        </div>
      )}

      {/* 数字人说话字幕 - 富文本展示 */}
      {(currentResponse || isProcessing) && (
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-lg">💬</span>
            <span className="text-xs font-semibold text-blue-700">数字人正在说话</span>
            {isProcessing && (
              <span className="ml-auto flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                <span className="text-xs text-blue-600">回复中...</span>
              </span>
            )}
          </div>
          <div className="text-sm text-slate-700 max-h-32 overflow-y-auto">
            {formatContent(currentResponse || '正在思考...')}
          </div>
        </div>
      )}

      {/* Connection Controls */}
      {(state === 'offline' || state === 'error') ? (
        <button
          onClick={connect}
          disabled={!isSDKLoaded}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
        >
          连接数字人
        </button>
      ) : (
        <button
          onClick={disconnect}
          className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
        >
          断开连接
        </button>
      )}

      {/* Tips */}
      <div className="text-xs text-slate-500 space-y-1">
        <p>💡 未连接时不消耗积分</p>
        <p>💡 使用完毕请及时断开</p>
        {isSDKLoaded && hasKeys() && (
          <p className="text-green-600">✓ 密钥已配置，可以连接</p>
        )}
      </div>
    </div>
  );
}

// 使用 forwardRef 导出
export default forwardRef(AvatarContainer);
