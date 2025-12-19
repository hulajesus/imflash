import { useState, useEffect, useRef } from 'react';
import { Bell, Plus, Play, Pause, Smartphone } from 'lucide-react';
import { generateNewMockFeed } from '../services/mockData';
import { sendNewFeedNotification } from '../utils/notifications';
import { isIOSSafari, isStandalone, supportsNotifications, getPlatformName } from '../utils/platform';

interface NotificationTestProps {
  onNewFeed?: () => void;
}

// 真实的市场信息数据
const marketNotifications = [
  { title: 'ETH 质押收益出现波动', content: '过去 24 小时，ETH 质押 APR 上升约 0.4%' },
  { title: 'ETH 市场波动有所增强', content: '过去 12 小时，ETH 价格波动率较昨日提升约 18%' },
  { title: 'BTC 市场进入震荡区间', content: '过去 24 小时，BTC 在窄幅区间内反复波动，成交量变化不大' },
  { title: '整体市场情绪趋于谨慎', content: '过去 24 小时，稳定币链上流入量有所增加' },
  { title: '主流资产出现资金流入', content: '过去 6 小时，ETH 与 BTC 链上净流入金额有所上升' },
  { title: 'Meme 板块交易活跃度上升', content: '过去 2 小时，Meme 相关代币在 DEX 的交易量明显增加' },
  { title: 'Meme 交易活跃带动 Gas 上升', content: '过去 1 小时，以太坊网络平均 Gas 费用出现明显上涨' },
  { title: '出现多笔大额链上转账', content: '过去 3 小时，主流资产相关的大额转账次数有所增加' },
  { title: '交易所相关资金流动增加', content: '过去 24 小时，链上出现多笔与中心化平台相关的大额转移' },
  { title: 'Layer2 网络活跃度上升', content: '过去 24 小时，部分 Layer2 网络交易数量明显增加' },
  { title: '以太坊网络活跃度有所回升', content: '过去 24 小时，以太坊链上交易笔数较前一日有所增加' },
  { title: 'Layer2 生态使用率持续提升', content: '过去 7 天，多条 Layer2 网络的日均交易量保持增长' },
  { title: '跨链桥整体使用频率上升', content: '过去 24 小时，主流跨链桥的资产转移次数有所增加' },
  { title: '稳定币链上流通规模变化', content: '过去 48 小时，主流稳定币在多条网络上的流通量出现调整' },
  { title: 'DeFi 总锁仓规模小幅波动', content: '过去 24 小时，DeFi 协议整体 TVL 出现小幅变化' },
  { title: '借贷市场资金利用率变化', content: '过去 24 小时，多数借贷协议的资金使用率出现调整' },
  { title: '去中心化交易活跃度上升', content: '过去 12 小时，DEX 整体成交量较前一周期有所增长' },
  { title: '近期行业安全事件增多', content: '过去 7 天，公开披露的协议安全事件数量有所增加' },
  { title: '链上资金结构出现变化', content: '过去 24 小时，资金在主流资产与稳定币之间的流动有所增强' },
  { title: '加密行业情绪保持观望', content: '近期市场参与者整体操作频率未出现明显提升' },
];

export const NotificationTest = ({ onNewFeed }: NotificationTestProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastNotification, setLastNotification] = useState<string>('');
  const [isAutoPushing, setIsAutoPushing] = useState(false);
  const [pushCount, setPushCount] = useState(0);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 平台检测
  const isIOS = isIOSSafari();
  const isPWA = isStandalone();
  const notificationSupported = supportsNotifications();
  const platformName = getPlatformName();
  
  // PWA 状态
  const [swRegistered, setSwRegistered] = useState(false);
  
  useEffect(() => {
    // 检查 Service Worker 是否已注册
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        setSwRegistered(!!registration);
      });
    }
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleAddNewFeed = () => {
    // 生成新的模拟信息流
    const newFeed = generateNewMockFeed();
    
    // 发送通知
    sendNewFeedNotification(1, newFeed.title);
    
    setLastNotification(`已添加: ${newFeed.title}`);
    
    // 通知父组件刷新数据
    if (onNewFeed) {
      onNewFeed();
    }

    // 3秒后清除提示
    setTimeout(() => {
      setLastNotification('');
    }, 3000);
  };

  const handleTestNotification = () => {
    sendNewFeedNotification(1, '测试通知 - 这是一条测试消息');
    setLastNotification('已发送测试通知');
    
    setTimeout(() => {
      setLastNotification('');
    }, 3000);
  };

  // 自动推送通知
  const handleToggleAutoPush = () => {
    if (isAutoPushing) {
      // 停止推送
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsAutoPushing(false);
      setLastNotification('已停止自动推送');
    } else {
      // 开始推送
      setIsAutoPushing(true);
      setPushCount(0);
      setLastNotification('开始自动推送（每10秒一条）');
      
      // 立即发送第一条
      const firstNotification = marketNotifications[0];
      sendNewFeedNotification(1, firstNotification.title);
      setPushCount(1);
      
      // 设置定时器
      let count = 1;
      intervalRef.current = setInterval(() => {
        if (count >= marketNotifications.length) {
          // 推送完毕
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsAutoPushing(false);
          setLastNotification('所有通知已推送完毕');
          return;
        }
        
        const notification = marketNotifications[count];
        sendNewFeedNotification(1, notification.title);
        setPushCount(count + 1);
        setLastNotification(`已推送: ${notification.title}`);
        count++;
      }, 10000); // 10秒
    }
    
    setTimeout(() => {
      setLastNotification('');
    }, 3000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg
                   hover:bg-purple-600 active:scale-95 transition-all z-50
                   flex items-center justify-center"
        title="通知测试工具"
      >
        <Bell className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl p-4 w-80 z-50 border border-gray-200">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900">通知测试工具</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* 平台信息 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-1">
        <p className="text-xs text-gray-600">
          <span className="font-medium">平台:</span> {platformName}
        </p>
        <p className="text-xs text-gray-600">
          <span className="font-medium">PWA 模式:</span> {isPWA ? '✅ 是' : '❌ 否'}
        </p>
        <p className="text-xs text-gray-600">
          <span className="font-medium">Service Worker:</span> {swRegistered ? '✅ 已注册' : '❌ 未注册'}
        </p>
        <p className="text-xs text-gray-600">
          <span className="font-medium">通知支持:</span> {notificationSupported ? '✅ 支持' : '❌ 不支持'}
        </p>
      </div>

      {/* PWA 成功提示 */}
      {isPWA && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-2">
            <span className="text-xl">✅</span>
            <div className="flex-1">
              <p className="text-xs text-green-700 font-medium mb-1">
                PWA 模式已启用
              </p>
              <p className="text-xs text-green-600">
                应用正在以 PWA 模式运行，支持接收系统通知
              </p>
            </div>
          </div>
        </div>
      )}

      {/* iOS 提示 */}
      {isIOS && !isPWA && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="flex items-start gap-2">
            <Smartphone className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-orange-700 font-medium mb-1">
                📱 iOS 用户提示
              </p>
              <p className="text-xs text-orange-600 mb-2">
                iOS Safari 需要将应用添加到主屏幕（PWA 模式）才能接收通知
              </p>
              <button
                onClick={() => setShowIOSGuide(!showIOSGuide)}
                className="text-xs text-orange-600 underline hover:text-orange-700"
              >
                {showIOSGuide ? '收起指南' : '查看 PWA 安装指南'}
              </button>
            </div>
          </div>

          {/* iOS PWA 安装指南 */}
          {showIOSGuide && (
            <div className="mt-3 pt-3 border-t border-orange-200 space-y-2">
              <p className="text-xs text-orange-700 font-medium mb-2">
                📲 如何安装 PWA 应用：
              </p>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 font-bold text-xs">1.</span>
                <p className="text-xs text-orange-700">点击 Safari 底部的"分享"按钮（方框带向上箭头）</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 font-bold text-xs">2.</span>
                <p className="text-xs text-orange-700">向下滚动，找到"添加到主屏幕"</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 font-bold text-xs">3.</span>
                <p className="text-xs text-orange-700">可以修改应用名称，然后点击"添加"</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 font-bold text-xs">4.</span>
                <p className="text-xs text-orange-700">返回主屏幕，点击新图标启动应用</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 font-bold text-xs">5.</span>
                <p className="text-xs text-orange-700">在 PWA 模式下允许通知权限</p>
              </div>
              <div className="mt-2 p-2 bg-orange-100 rounded">
                <p className="text-xs text-orange-800">
                  💡 必须从主屏幕启动才能接收通知，从 Safari 打开不支持！
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 不支持通知的提示 */}
      {!notificationSupported && !isIOS && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-700 font-medium mb-1">
            ⚠️ 通知不可用
          </p>
          <p className="text-xs text-red-600">
            当前浏览器不支持通知功能
          </p>
        </div>
      )}

      {/* 说明 */}
      <p className="text-xs text-gray-500 mb-4">
        用于测试浏览器通知功能，点击按钮模拟新信息流
      </p>

      {/* 操作按钮 */}
      <div className="space-y-2">
        <button
          onClick={handleToggleAutoPush}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                     active:scale-98 transition-all font-medium ${
                       isAutoPushing
                         ? 'bg-red-500 text-white hover:bg-red-600'
                         : 'bg-green-500 text-white hover:bg-green-600'
                     }`}
        >
          {isAutoPushing ? (
            <>
              <Pause className="w-4 h-4" />
              停止自动推送
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              开始自动推送
            </>
          )}
        </button>

        {isAutoPushing && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-700">
              📊 已推送: {pushCount} / {marketNotifications.length}
            </p>
          </div>
        )}

        <button
          onClick={handleAddNewFeed}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-xl
                     hover:bg-purple-600 active:scale-98 transition-all font-medium"
        >
          <Plus className="w-4 h-4" />
          添加新信息流
        </button>

        <button
          onClick={handleTestNotification}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl
                     hover:bg-gray-200 active:scale-98 transition-all font-medium"
        >
          <Bell className="w-4 h-4" />
          发送测试通知
        </button>
      </div>

      {/* 状态提示 */}
      {lastNotification && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-xs text-green-700">{lastNotification}</p>
        </div>
      )}

      {/* 提示信息 */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs text-blue-700 mb-1">
          💡 提示：请确保已开启通知权限
        </p>
        <p className="text-xs text-blue-600">
          自动推送：每10秒推送一条真实市场信息
        </p>
      </div>
    </div>
  );
};
