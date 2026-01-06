import { useState } from 'react';
import { useKeyStore } from '../../store/keyStore';
import type { ApiKeys } from '@shared/types';

interface KeyInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 内置测试密钥
const DEFAULT_KEYS: ApiKeys = {
  modelscopeApiKey: 'ms-85ed98e9-1a8e-41e5-8215-ee563559d069',
  xingyunAppId: 'b91e4bdb81ed4567bde3ba242b9bf042',
  xingyunAppSecret: '913d8ede47474927a441be29e6b560af',
};

export default function KeyInputModal({ isOpen, onClose }: KeyInputModalProps) {
  const { setApiKeys, hasKeys } = useKeyStore();
  const [keys, setKeysState] = useState<ApiKeys>(DEFAULT_KEYS);
  const [showSecret, setShowSecret] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 强制显示：如果没有有效密钥，阻止关闭
  if (!isOpen && !hasKeys()) {
    return null;
  }

  // 首次进入或无密钥时，禁用关闭按钮
  const canClose = hasKeys();

  const handleSubmit = () => {
    // 只有在验证通过后才能保存
    if (validationResult?.success) {
      setApiKeys(keys, false);
      onClose();
      setValidationResult(null);
    } else {
      setValidationResult({
        success: false,
        message: '请先验证密钥有效性'
      });
    }
  };

  const handleValidateKeys = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      // 调用后端验证 API
      const response = await fetch('/api/validate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelscopeApiKey: keys.modelscopeApiKey
        })
      });

      const data = await response.json();

      if (data.valid) {
        setValidationResult({
          success: true,
          message: '✓ 密钥验证通过！可以正常使用'
        });
      } else {
        // 显示具体错误信息
        const errors: string[] = [];
        if (!data.modelscope?.valid) {
          errors.push(`ModelScope: ${data.modelscope.error || '密钥无效'}`);
        }

        setValidationResult({
          success: false,
          message: errors.join(' | ')
        });
      }
    } catch (error: any) {
      console.error('[KeyInputModal] Validation error:', error);
      setValidationResult({
        success: false,
        message: error.message || '网络连接失败，请检查网络'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (field: keyof ApiKeys, value: string) => {
    setKeysState((prev) => ({ ...prev, [field]: value }));
    // 输入时清除验证结果
    setValidationResult(null);
  };

  // 如果模态框未打开且已有密钥，不显示
  if (!isOpen && canClose) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">🔑 配置 API 密钥</h2>
          <p className="text-sm text-slate-500 mt-1">
            {!canClose ? '首次使用需要配置并验证 API 密钥' : '请配置您的 API 密钥'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Fill Default Keys Button */}
          <button
            onClick={() => {
              setKeysState(DEFAULT_KEYS);
              setValidationResult(null);
            }}
            className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-medium">填充内置测试密钥</span>
          </button>

          {/* Custom Keys Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ModelScope API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={keys.modelscopeApiKey}
                onChange={(e) => handleChange('modelscopeApiKey', e.target.value)}
                placeholder="ms-xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">
                从{' '}
                <a
                  href="https://modelscope.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  魔搭社区
                </a>{' '}
                获取
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                星云 App ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={keys.xingyunAppId}
                onChange={(e) => handleChange('xingyunAppId', e.target.value)}
                placeholder="32位应用ID"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                星云 App Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={keys.xingyunAppSecret}
                  onChange={(e) => handleChange('xingyunAppSecret', e.target.value)}
                  placeholder="32位应用密钥"
                  className="w-full px-3 py-2 pr-20 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700"
                >
                  {showSecret ? '隐藏' : '显示'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                从{' '}
                <a
                  href="https://nebula.xingyun3d.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  星云控制台
                </a>{' '}
                获取
              </p>
            </div>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className={`p-3 rounded-lg border ${
              validationResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm ${
                validationResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.message}
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              🔒 密钥仅存储在您的浏览器本地，不会上传到任何服务器
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-between gap-3">
          <button
            onClick={handleValidateKeys}
            disabled={isValidating}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                检测中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                检测密钥
              </>
            )}
          </button>
          <div className="flex gap-3">
            {canClose && (
              <button
                onClick={() => {
                  onClose();
                  setValidationResult(null);
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!validationResult?.success}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
