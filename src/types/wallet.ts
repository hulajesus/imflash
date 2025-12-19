export interface WalletInfo {
  address: string;
  chainId?: number;
  network?: string;
}

export type WalletProvider = 'metamask' | 'imtoken' | null;

export interface WalletState {
  isConnected: boolean;
  wallet: WalletInfo | null;
  provider: WalletProvider;
  isLoading: boolean;
  error: string | null;
}




