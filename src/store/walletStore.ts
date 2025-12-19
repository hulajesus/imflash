import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletState, WalletInfo, WalletProvider } from '../types/wallet';

interface InterestTag {
  id: string;
  name: string;
  icon: string;
}

interface WalletStore extends WalletState {
  interestTags: InterestTag[];
  connect: (wallet: WalletInfo, provider: WalletProvider) => void;
  disconnect: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInterestTags: (tags: InterestTag[]) => void;
}

const initialState: WalletState = {
  isConnected: false,
  wallet: null,
  provider: null,
  isLoading: false,
  error: null,
};

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      ...initialState,
      interestTags: [],
      connect: (wallet, provider) =>
        set({
          isConnected: true,
          wallet,
          provider,
          error: null,
        }),
      disconnect: () => set({ ...initialState, interestTags: [] }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setInterestTags: (interestTags) => set({ interestTags }),
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({ interestTags: state.interestTags }),
    }
  )
);




