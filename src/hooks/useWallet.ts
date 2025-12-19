import { useAccount, useDisconnect, useChainId } from 'wagmi';

/**
 * 简化的钱包 hook，基于 wagmi
 * 提供钱包连接状态、地址、链信息等
 */
export const useWallet = () => {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  return {
    address,
    isConnected,
    chainId,
    connector,
    disconnect,
  };
};
