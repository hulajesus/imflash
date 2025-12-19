import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import App from './App.tsx'
import { config } from './config/wagmi'
import { customTheme } from './config/rainbowkit-theme'
import { registerServiceWorker } from './utils/pwa'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// 注册 Service Worker（支持 PWA 和通知）
if ('serviceWorker' in navigator) {
  registerServiceWorker().then((registration) => {
    if (registration) {
      console.log('[App] PWA 已启用，支持离线访问和通知');
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme} locale="zh-CN">
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)




