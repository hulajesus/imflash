import { useState, useEffect } from 'react';
import { connectWallet, detectWallet, getCurrentAddress } from '../services/blockchain';
import { useWalletStore } from '../store/walletStore';
import { WalletProvider } from '../types/wallet';

export const useWeb3 = () => {
  const { connect, disconnect, setLoading, setError, wallet, isConnected } = useWalletStore();
  const [detectedProvider, setDetectedProvider] = useState<WalletProvider>(null);

  useEffect(() => {
    // 检测钱包
    const provider = detectWallet();
    setDetectedProvider(provider);

    // 尝试恢复连接
    const restoreConnection = async () => {
      const address = await getCurrentAddress();
      if (address) {
        const provider = detectWallet();
        connect(
          { address },
          provider
        );
      }
    };

    restoreConnection();
  }, [connect]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const walletInfo = await connectWallet();
      const provider = detectWallet();
      
      connect(walletInfo, provider);
      
      // 保存到本地存储
      localStorage.setItem('wallet_address', walletInfo.address);
      localStorage.setItem('wallet_provider', provider || '');
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('wallet_provider');
  };

  return {
    connect: handleConnect,
    disconnect: handleDisconnect,
    detectedProvider,
    wallet,
    isConnected,
  };
};




