import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Tag as TagIcon, Eye, Settings } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAddressProfile, getOnChainData } from '../../services/api';
import { AddressProfile as AddressProfileType } from '../../types/api';
import { useNewFeedNotification } from '../../hooks/useNewFeedNotification';
import { useSupabaseNotifications } from '../../hooks/useSupabaseNotifications';

import { useWalletStore } from '../../store/walletStore';
import { SignalNotification } from '../../types/supabase';

export const AddressProfile = () => {
  const navigate = useNavigate();
  const { address: connectedAddress, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();
  
  // 从 URL 获取观察地址
  const searchParams = new URLSearchParams(window.location.search);
  const watchAddress = searchParams.get('address') || undefined;
  
  // 从 store 获取兴趣标签
  const interestTags = useWalletStore((state) => state.interestTags);
  
  // 使用连接的地址或观察地址
  const address = connectedAddress || watchAddress;
  const isWatchMode = !isConnected && !!watchAddress;

  // 通知 Toast 状态
  const [currentNotification, setCurrentNotification] = useState<SignalNotification | null>(null);

  // 如果既没有连接也没有观察地址，重定向到 Onboarding
  useEffect(() => {
    if (!address) {
      navigate('/');
    }
  }, [address, navigate]);

  // 使用新信息流通知 Hook - 默认开启
  useNewFeedNotification({
    address,
    enabled: true, // 默认开启
    pollingInterval: 30000, // 30秒检查一次
  });

  // 订阅 Supabase 实时通知
  useSupabaseNotifications({
    walletAddress: address,
    enabled: !!address,
    showBrowserNotification: true,
    onNotification: (notification) => {
      console.log('收到新的信号通知:', notification);
      // 显示页面内 Toast 通知
      setCurrentNotification(notification);
      // 刷新信息流数据
      queryClient.invalidateQueries({ queryKey: ['infoFeed', address] });
    },
  });

  // 获取地址画像
  const { data: profile, isLoading, error } = useQuery<AddressProfileType>({
    queryKey: ['addressProfile', address],
    queryFn: () => getAddressProfile(address!),
    enabled: !!address,
    retry: 2,
  });

  // 获取链上数据（用于生成标签）
  useQuery({
    queryKey: ['onChainData', address],
    queryFn: () => getOnChainData(address!),
    enabled: !!address && !profile, // 如果没有画像数据，尝试获取链上数据
  });

  // 格式化地址
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  // 处理断开连接
  const handleDisconnect = () => {
    disconnect();
    navigate('/');
  };



  if (!address) {
    return null;
  }

  // 处理通知点击 - 跳转到信息流页面
  const handleNotificationClick = () => {
    if (currentNotification) {
      // 将通知 ID 存储到 sessionStorage，供信息流页面使用
      sessionStorage.setItem('activeNotificationId', currentNotification.id);
      // 如果是观察模式，需要传递地址参数
      if (isWatchMode && watchAddress) {
        navigate(`/feed?address=${watchAddress}`);
      } else {
        navigate('/feed');
      }
    }
  };

  // 处理跳转到信息流
  const handleGoToFeed = () => {
    // 如果是观察模式，需要传递地址参数
    if (isWatchMode && watchAddress) {
      navigate(`/feed?address=${watchAddress}`);
    } else {
      navigate('/feed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">地址画像</h1>
          </div>
          
          {/* 右上角设置按钮 */}
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="切换地址"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>

      {/* 新通知提示条 */}
      {currentNotification && (
        <div 
          onClick={handleNotificationClick}
          className="bg-primary-500 border-b border-primary-600 px-4 py-3 cursor-pointer hover:bg-primary-600 active:bg-primary-700 transition-colors animate-slide-down"
        >
          <div className="flex items-center gap-3">
            <img src="/Symble_Square.svg" alt="通知" className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white mb-0.5">
                与你相关的链上动态
              </p>
              <p className="text-xs text-white/90 line-clamp-1">
                {currentNotification.notification_data.news_title}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-white/80">点击查看 →</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentNotification(null);
                }}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="关闭"
              >
                <span className="text-white text-lg leading-none">×</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 观察模式提示 */}
      {isWatchMode && (
        <div >
          
        </div>
      )}

      {/* 地址信息 */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {isWatchMode ? '观察地址' : '钱包地址'}
            </p>
            <p className="text-base font-mono text-gray-900">{formatAddress(address)}</p>
          </div>
          {chain && (
            <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-medium">
              {chain.name}
            </span>
          )}
        </div>
      </div>

      {/* 兴趣标签区域 */}
      {interestTags.length > 0 && (
        <div className="px-4 py-6 bg-white border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            <span className="text-xl">✨</span>
            你的兴趣标签
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            根据你选择的兴趣，我们会推送相关的市场信息
          </p>
          <div className="flex flex-wrap gap-2">
            {interestTags.map((tag) => (
              <span
                key={tag.id}
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium
                         border border-primary-200"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 行为标签区域 */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-primary-500" />
          你的行为标签
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          基于你的链上交易历史自动生成
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <span className="ml-3 text-gray-600">标签生成中...</span>
          </div>
        ) : error ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-card p-4 text-yellow-800 text-sm">
            <p>无法加载标签数据，请稍后重试</p>
          </div>
        ) : profile?.tags && profile.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium
                         border border-gray-300 hover:bg-gray-300 transition-colors"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-card p-4 text-center text-gray-500 text-sm">
            <p>暂无标签数据</p>
            <p className="text-xs mt-1">标签将基于你的链上行为自动生成</p>
          </div>
        )}
      </div>

      {/* 摘要区域 */}
      {profile?.summary && (
        <div className="px-4 py-6 bg-white border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">摘要</h2>
          <div className="space-y-3">
            {profile.summary.stakingBehavior && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">·</span>
                <p className="text-gray-700 flex-1">{profile.summary.stakingBehavior}</p>
              </div>
            )}
            {profile.summary.commonProtocols && profile.summary.commonProtocols.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">·</span>
                <p className="text-gray-700 flex-1">
                  常用协议: {profile.summary.commonProtocols.join(' / ')}
                </p>
              </div>
            )}
            {profile.summary.tradingPattern && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">·</span>
                <p className="text-gray-700 flex-1">{profile.summary.tradingPattern}</p>
              </div>
            )}
            {profile.summary.riskStyle && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">·</span>
                <p className="text-gray-700 flex-1">操作风格: {profile.summary.riskStyle}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 底部说明 */}
      <div className="px-4 py-6 bg-gray-50">
        <p className="text-xs text-gray-500 leading-relaxed">
          这些标签基于你过往的链上行为自动生成，会随着你的新行为逐步更新。
        </p>
      </div>

      {/* 导航到信息流 */}
      <div className="px-4 py-6 bg-white border-t border-gray-200">
        <button
          onClick={handleGoToFeed}
          className="w-full bg-primary-500 text-white py-3 rounded-card font-medium
                     hover:bg-primary-600 active:bg-primary-700 transition-colors"
        >
          查看个性化信息流
        </button>
      </div>


    </div>
  );
};





