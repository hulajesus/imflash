import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base, bsc } from 'wagmi/chains';
import {
  metaMaskWallet,
  walletConnectWallet,
  rainbowWallet,
  trustWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import type { Wallet } from '@rainbow-me/rainbowkit';

// 从 https://cloud.walletconnect.com 获取
// 注册后创建项目即可获得 Project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '18130ba77a2f7372f1103fc4c96cd14c';

// 自定义 imToken 钱包配置
const imTokenWallet = (): Wallet => ({
  id: 'imToken',
  name: 'imToken',
  iconUrl: 'Symble_Square.svg',
  iconBackground: '',
  downloadUrls: {
    android: 'https://token.im/download',
    ios: 'https://token.im/download',
    mobile: 'https://token.im/download',
    qrCode: 'https://token.im/download',
  },
  mobile: {
    getUri: (uri: string) => {
      return `imtokenv2://navigate/DappView?url=${encodeURIComponent(uri)}`;
    },
  },
  qrCode: {
    getUri: (uri: string) => uri,
    instructions: {
      learnMoreUrl: 'https://token.im',
      steps: [
        {
          description: '打开 imToken App',
          step: 'install' as const,
          title: '打开 imToken',
        },
        {
          description: '点击右上角扫码图标',
          step: 'create' as const,
          title: '扫描二维码',
        },
        {
          description: '扫描二维码并确认连接',
          step: 'scan' as const,
          title: '确认连接',
        },
      ],
    },
  },
  createConnector: (walletDetails) => {
    // 使用 WalletConnect 作为底层连接器
    const walletConnectConnector = walletConnectWallet({ projectId });
    return walletConnectConnector.createConnector(walletDetails);
  },
});

// 配置钱包连接器
const connectors = connectorsForWallets(
  [
    {
      groupName: '推荐',
      wallets: [
        metaMaskWallet,
        imTokenWallet, // imToken 钱包
        walletConnectWallet,
      ],
    },
    {
      groupName: '其他',
      wallets: [
        rainbowWallet,
        trustWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName: 'ImToken Style Wallet',
    projectId,
  }
);

// 创建 wagmi 配置
export const config = createConfig({
  connectors,
  chains: [mainnet, polygon, optimism, arbitrum, base, bsc],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
  },
});
