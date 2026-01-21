import { create } from 'zustand';
import type { ApiKeys } from '@shared/types';

// 内置测试密钥
export const DEFAULT_KEYS: ApiKeys = {
  modelscopeApiKey: 'ms-85ed98e9-1a8e-41e5-8215-ee563559d069',
  xingyunAppId: 'b91e4bdb81ed4567bde3ba242b9bf042',
  xingyunAppSecret: '913d8ede47474927a441be29e6b560af',
};

interface KeyStoreState {
  apiKeys: ApiKeys | null;
  isUsingDefault: boolean;
  setApiKeys: (keys: ApiKeys, isDefault?: boolean) => void;
  clearApiKeys: () => void;
  hasKeys: () => boolean;
  getModelScopeKey: () => string;
  getXingyunAppId: () => string;
  getXingyunAppSecret: () => string;
}

export const useKeyStore = create<KeyStoreState>()((set, get) => ({
  apiKeys: null,
  isUsingDefault: false,

  setApiKeys: (keys, isDefault = false) =>
    set({ apiKeys: keys, isUsingDefault: isDefault }),

  clearApiKeys: () =>
    set({ apiKeys: null, isUsingDefault: false }),

  hasKeys: () => {
    const keys = get().apiKeys;
    return !!keys && !!keys.modelscopeApiKey && !!keys.xingyunAppId && !!keys.xingyunAppSecret;
  },

  getModelScopeKey: () => get().apiKeys?.modelscopeApiKey || DEFAULT_KEYS.modelscopeApiKey,
  getXingyunAppId: () => get().apiKeys?.xingyunAppId || DEFAULT_KEYS.xingyunAppId,
  getXingyunAppSecret: () => get().apiKeys?.xingyunAppSecret || DEFAULT_KEYS.xingyunAppSecret,
}));
