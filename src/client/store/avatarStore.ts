import { create } from 'zustand';
import type { AvatarState, AvatarActionState } from '@shared/types';

interface AvatarStoreState {
  state: AvatarState;
  actionState: AvatarActionState;
  isSDKLoaded: boolean;
  setState: (state: AvatarState) => void;
  setActionState: (state: AvatarActionState) => void;
  setSDKLoaded: (loaded: boolean) => void;
}

export const useAvatarStore = create<AvatarStoreState>()((set) => ({
  state: 'offline',
  actionState: 'idle',
  isSDKLoaded: false,

  setState: (state) => set({ state }),
  setActionState: (actionState) => set({ actionState }),
  setSDKLoaded: (isSDKLoaded) => set({ isSDKLoaded }),
}));
