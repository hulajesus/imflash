import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, X, ExternalLink, Loader2, HeartCrack, TrendingUp, TrendingDown } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInfoFeed, getHistoryFeed, submitFeedAction, getWalletSignals, type WalletSignal } from '../../services/api';
import { InfoFeedItem } from '../../types/api';
import { useSupabaseNotifications } from '../../hooks/useSupabaseNotifications';
import { formatDistanceToNow } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';

export const InfoFeed = () => {
  const navigate = useNavigate();
  const { address: connectedAddress, isConnected } = useAccount();
  const [showHistory, setShowHistory] = useState(false);
  const queryClient = useQueryClient();

  // 从 URL 获取观察地址
  const searchParams = new URLSearchParams(window.location.search);
  const watchAddress = searchParams.get('address') || undefined;
  
  // 使用连接的地址或观察地址
  const address = connectedAddress || watchAddress;
  const isWatchMode = !isConnected && !!watchAddress;

  // 获取钱包信号（最新的 3 条）- 直接从数据库读取避免 CORS
  const { data: walletSignalsResponse, isLoading: isLoadingSignals } = useQuery({
    queryKey: ['walletSignals', address],
    queryFn: () => getWalletSignals(address!, 30),
    enabled: !!address,
    refetchInterval: 60000, // 每分钟刷新一次
  });

  const walletSignals = walletSignalsResponse?.signals || [];

  // 获取信息流
  const { data: feedItems = [], isLoading } = useQuery<InfoFeedItem[]>({
    queryKey: ['infoFeed', address],
    queryFn: () => getInfoFeed(address!),
    enabled: !!address && !showHistory,
    refetchInterval: 30000, // 每30秒刷新一次
  });

  // 清除通知标记
  useEffect(() => {
    const notificationId = sessionStorage.getItem('activeNotificationId');
    if (notificationId) {
      console.log('清除通知标记:', notificationId);
      sessionStorage.removeItem('activeNotificationId');
    }
  }, []);

  // 订阅 Supabase 实时通知（观察模式也可以订阅）
  useSupabaseNotifications({
    walletAddress: address,
    enabled: !!address,
    showBrowserNotification: true,
    onNotification: (notification) => {
      console.log('信息流页面收到新通知:', notification);
      // 刷新钱包信号数据和信息流
      queryClient.invalidateQueries({ queryKey: ['walletSignals', address] });
      queryClient.invalidateQueries({ queryKey: ['infoFeed', address] });
    },
  });

  // 获取历史信息流
  const { data: historyItems = [], isLoading: isLoadingHistory } = useQuery<InfoFeedItem[]>({
    queryKey: ['historyFeed', address],
    queryFn: () => getHistoryFeed(address!),
    enabled: !!address && showHistory,
  });

  // 提交操作
  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'like' | 'dislike' | 'close' }) =>
      submitFeedAction(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infoFeed', address] });
    },
  });

  const handleAction = (id: string, action: 'like' | 'dislike' | 'close') => {
    actionMutation.mutate({ id, action });
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: zhCN });
    } catch {
      return timestamp;
    }
  };

  const currentItems = showHistory ? historyItems : feedItems;
  const currentLoading = showHistory ? isLoadingHistory : isLoading;

  // 如果既没有连接也没有观察地址，重定向到首页
  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先连接钱包或输入观察地址</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary-500 hover:text-primary-600"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 处理返回到地址画像页面
  const handleGoBack = () => {
    // 如果是观察模式，需要传递地址参数
    if (isWatchMode && watchAddress) {
      navigate(`/profile?address=${watchAddress}`);
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {showHistory ? '历史信息流' : '为你精选的链上信息'}
            </h1>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={showHistory ? '返回实时信息流' : '查看历史'}
          >
            <Clock className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* 观察模式提示 */}
      {isWatchMode && (
        <div >

        </div>
      )}

      {/* 钱包信号列表 - 显示在顶部 */}
      {isLoadingSignals ? (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">加载信号中...</p>
          </div>
        </div>
      ) : walletSignals && walletSignals.length > 0 ? (
        <div className="px-4 pt-4 space-y-3">
          {walletSignals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} formatTime={formatTime} />
          ))}
        </div>
      ) : null}

      {/* 信息流列表 */}
      <div className="px-4 py-4 space-y-4">
        {currentLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <span className="ml-3 text-gray-600">加载中...</span>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="bg-white rounded-card p-8 text-center">
            <p className="text-gray-500 mb-2">
              {showHistory ? '暂无历史信息' : '暂无新信息'}
            </p>
            <p className="text-sm text-gray-400">
              {showHistory
                ? '历史信息将在这里显示'
                : '符合你标签的信息将在这里显示'}
            </p>
          </div>
        ) : (
          currentItems.map((item) => (
            <InfoCard
              key={item.id}
              item={item}
              onAction={handleAction}
              formatTime={formatTime}
            />
          ))
        )}
      </div>
    </div>
  );
};

// 信号卡片组件
interface SignalCardProps {
  signal: WalletSignal;
  formatTime: (timestamp: string) => string;
}

const SignalCard = ({ signal, formatTime }: SignalCardProps) => {
  const [isDisliked, setIsDisliked] = useState(false);

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return 'text-green-600 bg-green-50';
      case 'bearish':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy':
        return <TrendingUp className="w-4 h-4" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getStrengthBadge = (strength: string) => {
    const colors = {
      strong: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      weak: 'bg-gray-100 text-gray-700',
    };
    return colors[strength as keyof typeof colors] || colors.weak;
  };

  const handleDislike = () => {
    setIsDisliked(true);
    // TODO: 调用 API 标记为不感兴趣
    console.log('标记信号为不感兴趣:', signal.id);
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      {/* 头部：事件类型和时间 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
            {signal.event_type}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStrengthBadge(signal.strength)}`}>
            {signal.strength}
          </span>
        </div>
        <span className="text-xs text-gray-500">{formatTime(signal.created_at)}</span>
      </div>

      {/* 摘要 */}
      <h3 className="text-base font-semibold text-gray-900 mb-2 leading-snug">
        {signal.summary_cn || '暂无摘要'}
      </h3>

      {/* 资产信息 - 只在有资产名称时显示 */}
      {signal.asset_names && signal.asset_names.trim() && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs text-gray-600">资产:</span>
          {signal.asset_names.split('、').map((asset, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
              {asset.trim()}
            </span>
          ))}
        </div>
      )}

      {/* 操作建议和方向 - 只显示非 observe 的操作 */}
      {signal.action !== 'observe' && (
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            {getActionIcon(signal.action)}
            <span className="text-sm font-medium text-gray-700 capitalize">{signal.action}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${getDirectionColor(signal.direction)}`}>
            <span className="text-sm font-medium capitalize">{signal.direction}</span>
          </div>
        </div>
      )}

      {/* 备注 */}
      {signal.notes && signal.notes.trim() && (
        <p className="text-sm text-gray-700 leading-relaxed mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {signal.notes}
        </p>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <button
          onClick={handleDislike}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isDisliked
              ? 'bg-gray-200 text-gray-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HeartCrack className="w-4 h-4" />
          不感兴趣
        </button>
        <a
          href="https://tokenlon.im/instant"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          交易
        </a>
      </div>
    </div>
  );
};

// 信息卡片组件
interface InfoCardProps {
  item: InfoFeedItem;
  onAction: (id: string, action: 'like' | 'dislike' | 'close') => void;
  formatTime: (timestamp: string) => string;
}

const InfoCard = ({ item, onAction, formatTime }: InfoCardProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onAction(item.id, 'close');
    }, 300);
  };

  const handleDislike = () => {
    setIsDisliked(true);
    onAction(item.id, 'dislike');
  };

  if (isClosing) {
    return null;
  }

  return (
    <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100">
      {/* 标题和标签 */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center flex-1">
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <button
              onClick={() => {
                // 查看详情逻辑
                console.log('查看详情:', item.id);
              }}
              className="p-1 hover:bg-primary-50 rounded transition-colors flex-shrink-0"
              title="查看详情"
            >
              <ExternalLink className="w-4 h-4 text-primary-600" />
            </button>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2 py-1 bg-primary-50 text-primary-600 rounded-full">
            {item.category}
          </span>
          {item.relatedTags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 内容 */}
      <p className="text-gray-700 text-sm leading-relaxed mb-3">{item.content}</p>

      {/* 时间戳 */}
      <p className="text-xs text-gray-400 mb-3">{formatTime(item.timestamp)}</p>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 px-4">
        <button
          onClick={handleDislike}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isDisliked
              ? 'bg-gray-200 text-gray-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HeartCrack className="w-4 h-4" />
          不感兴趣
        </button>
        <a
          href="https://tokenlon.im/instant"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          交易
        </a>
      </div>
    </div>
  );
};

