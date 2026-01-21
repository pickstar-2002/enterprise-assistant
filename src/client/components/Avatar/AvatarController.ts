// 数字人 SDK 控制器
// 官方文档: https://xingyun3d.com/developers/52-183

// 全局 XmovAvatar 类型声明
declare global {
  interface XmovAvatarConfig {
    containerId: string;
    appId: string;
    appSecret: string;
    gatewayServer: string;
    onWidgetEvent?: (data: any) => void;
    proxyWidget?: Record<string, (data: any) => void>;
    onNetworkInfo?: (info: any) => void;
    onMessage?: (message: any) => void;
    onStateChange?: (state: string) => void;
    onStatusChange?: (status: any) => void;
    onStateRenderChange?: (state: string, duration: number) => void;
    onVoiceStateChange?: (status: string) => void;
    enableLogger?: boolean;
  }

  interface XmovAvatarSDK {
    init(options?: { onDownloadProgress?: (progress: number) => void }): Promise<void>;
    speak(ssml: string, isStart: boolean, isEnd: boolean): void;
    listen(): void;
    think(): void;
    idle(): void;
    interactiveidle(): void;
    offlineMode(): void;
    onlineMode(): void;
    setVolume(volume: number): void;
    showDebugInfo(): void;
    hideDebugInfo(): void;
    destroy(): void;
  }

  const XmovAvatar: new (config: XmovAvatarConfig) => XmovAvatarSDK;
}

export class AvatarController {
  private sdk: XmovAvatarSDK | null = null;
  private isInitialized = false;
  private initError: Error | null = null;
  private containerIdWithHash: string;

  constructor(containerId: string) {
    // 官方文档要求 containerId 必须带 # 前缀
    this.containerIdWithHash = containerId.startsWith('#') ? containerId : `#${containerId}`;
  }

  async init(
    appId: string,
    appSecret: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (this.isInitialized) {
      console.log('Avatar already initialized');
      return;
    }

    // 检查 SDK 是否已加载
    if (typeof (window as any).XmovAvatar !== 'function') {
      throw new Error('SDK 未加载，请稍后再试');
    }

    // 检查容器是否存在
    const container = document.querySelector(this.containerIdWithHash);
    if (!container) {
      throw new Error(`找不到容器元素: ${this.containerIdWithHash}`);
    }

    console.log('Initializing avatar with container:', this.containerIdWithHash);
    console.log('App ID:', appId.substring(0, 8) + '...');

    try {
      const XmovAvatarClass = (window as any).XmovAvatar;

      this.sdk = new XmovAvatarClass({
        containerId: this.containerIdWithHash,
        appId,
        appSecret,
        gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',
        onMessage: (message: any) => {
          console.log('SDK message:', message);
          // 检查错误消息 (官方文档定义的错误码)
          if (message && message.code && message.code !== 0) {
            const errorMsg = message.message || 'SDK 初始化失败';
            console.error('SDK error:', message.code, errorMsg);
            this.initError = new Error(`[${message.code}] ${errorMsg}`);
          }
        },
        onStateChange: (state: string) => {
          console.log('SDK state change:', state);
        },
        onStatusChange: (status: any) => {
          console.log('SDK status change:', status);
        },
        onVoiceStateChange: (status: string) => {
          console.log('Voice state change:', status);
        },
        onNetworkInfo: (info: any) => {
          console.log('Network info:', info);
        },
        enableLogger: true, // 开启日志便于调试
      });

      if (!this.sdk) {
        throw new Error('SDK 初始化失败');
      }

      await this.sdk.init({
        onDownloadProgress: (progress) => {
          console.log(`SDK loading progress: ${progress}%`);
          if (onProgress) {
            onProgress(progress);
          }
        },
      });

      // 检查是否有初始化错误
      if (this.initError) {
        throw this.initError;
      }

      // 调整数字人位置居中
      this.centerAvatar();

      this.isInitialized = true;
      console.log('Avatar SDK initialized successfully');
    } catch (error: any) {
      console.error('SDK initialization failed:', error);
      this.destroy();
      throw new Error(error.message || 'SDK 初始化失败，请检查密钥是否正确');
    }
  }

  speak(text: string): void {
    if (!this.sdk) return;
    // 非流式调用：一次性说完
    this.sdk.speak(text, true, true);
  }

  speakStream(content: string, isStart: boolean, isEnd: boolean): void {
    if (!this.sdk) return;
    this.sdk.speak(content, isStart, isEnd);
  }

  listen(): void {
    if (!this.sdk) return;
    this.sdk.listen();
  }

  think(): void {
    if (!this.sdk) return;
    this.sdk.think();
  }

  idle(): void {
    if (!this.sdk) return;
    this.sdk.idle();
  }

  interactiveIdle(): void {
    if (!this.sdk) return;
    this.sdk.interactiveidle();
  }

  offlineMode(): void {
    if (!this.sdk) return;
    this.sdk.offlineMode();
  }

  onlineMode(): void {
    if (!this.sdk) return;
    this.sdk.onlineMode();
  }

  setVolume(volume: number): void {
    if (!this.sdk) return;
    this.sdk.setVolume(volume);
  }

  showDebugInfo(): void {
    if (!this.sdk) return;
    this.sdk.showDebugInfo();
  }

  /**
   * 将数字人位置居中
   * SDK 内部使用绝对定位，需要通过 CSS 调整
   */
  private centerAvatar(): void {
    try {
      const container = document.querySelector(this.containerIdWithHash);
      if (!container) return;

      // 查找 SDK 渲染的 canvas 或 video 元素
      const avatarElement = container.querySelector('canvas, video, iframe');
      if (avatarElement) {
        // 使用 CSS 让数字人容器居中
        (avatarElement as HTMLElement).style.position = 'absolute';
        (avatarElement as HTMLElement).style.left = '50%';
        (avatarElement as HTMLElement).style.top = '50%';
        (avatarElement as HTMLElement).style.transform = 'translate(-50%, -50%)';
        (avatarElement as HTMLElement).style.maxWidth = '100%';
        (avatarElement as HTMLElement).style.maxHeight = '100%';
        console.log('Avatar centered');
      }

      // 同时查找可能的内部包装容器
      const wrapper = container.querySelector('[class*="avatar"], [class*="Avatar"], [class*="model"], [id*="avatar"], [id*="Avatar"]');
      if (wrapper && wrapper !== avatarElement) {
        (wrapper as HTMLElement).style.display = 'flex';
        (wrapper as HTMLElement).style.justifyContent = 'center';
        (wrapper as HTMLElement).style.alignItems = 'center';
        (wrapper as HTMLElement).style.width = '100%';
        (wrapper as HTMLElement).style.height = '100%';
      }
    } catch (error) {
      console.error('Failed to center avatar:', error);
    }
  }

  destroy(): void {
    if (this.sdk) {
      try {
        this.sdk.destroy();
      } catch (error) {
        console.error('Error destroying SDK:', error);
      }
      this.sdk = null;
      this.isInitialized = false;
      this.initError = null;
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.sdk !== null;
  }
}
