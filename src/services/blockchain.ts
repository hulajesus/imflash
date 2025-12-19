import { ethers } from 'ethers';
import { WalletInfo, WalletProvider } from '../types/wallet';

// 检测钱包类型
export const detectWallet = (): WalletProvider => {
  if (typeof window === 'undefined') return null;
  
  // 检测 imToken
  if ((window as any).ethereum?.isImToken) {
    return 'imtoken';
  }
  
  // 检测 MetaMask
  if ((window as any).ethereum?.isMetaMask) {
    return 'metamask';
  }
  
  // 通用 ethereum provider
  if ((window as any).ethereum) {
    return 'metamask'; // 默认当作 MetaMask 处理
  }
  
  return null;
};

// 连接钱包
export const connectWallet = async (): Promise<WalletInfo> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('未检测到钱包，请安装 MetaMask 或 imToken');
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  
  try {
    // 请求账户访问权限
    await provider.send('eth_requestAccounts', []);
    
    // 获取签名者
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // 获取网络信息
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    return {
      address,
      chainId,
      network: network.name,
    };
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('用户拒绝了连接请求');
    }
    throw new Error(`连接失败: ${error.message}`);
  }
};

// 断开连接
export const disconnectWallet = () => {
  // 清除本地存储的钱包信息
  localStorage.removeItem('wallet_address');
  localStorage.removeItem('wallet_provider');
};

// 获取当前连接的地址
export const getCurrentAddress = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch {
    return null;
  }
};




