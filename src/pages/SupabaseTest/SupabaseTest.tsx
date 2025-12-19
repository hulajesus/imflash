import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash2, Play, Square } from 'lucide-react';
import { useAccount } from 'wagmi';
import { supabase } from '../../config/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Notification {
  id: string;
  wallet_address: string;
  notification_data: any;
  created_at: string;
}

interface SignalData {
  news_id: string;
  news_title: string;
  news_content: string;
  news_url: string;
  published_at: string;
  final_score: number;
  matched_tags: string[];
  sentiment_score?: number;
  relevance_score?: number;
}

interface LogEntry {
  id: number;
  timestamp: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

export const SupabaseTest = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [testAddress, setTestAddress] = useState(address || '');
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('未订阅');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [latestSignal, setLatestSignal] = useState<SignalData | null>(null);
  const [fetchingSignal, setFetchingSignal] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const logIdRef = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 添加日志
  const addLog = (type: LogEntry['type'], message: string) => {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    const newLog: LogEntry = {
      id: logIdRef.current++,
      timestamp,
      type,
      message,
    };
    setLogs((prev) => [...prev, newLog]);
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  };

  // 自动滚动到日志底部
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // 获取最新信号数据
  const fetchLatestSignal = async (walletAddress: string) => {
    setFetchingSignal(true);
    addLog('info', '正在获取最新信号数据...');

    try {
      const response = await fetch(
        'https://woxbgotwkbbtiaerzrqu.supabase.co/functions/v1/wallet-signals',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveGJnb3R3a2JidGlhZXJ6cnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU3MzMsImV4cCI6MjA3NDkzMTczM30.oS0b-N1l7midTEZ1qlD8qovPB_IkeJM5cYele7AZ10M',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet: walletAddress,
            limit: 1,
            min_score: 0.3,
            verbose: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.signals && data.signals.length > 0) {
        const signal = data.signals[0];
        setLatestSignal(signal);
        addLog('success', `✅ 获取到最新信号: ${signal.news_title}`);
        console.log('📊 最新信号数据:', signal);
      } else {
        addLog('info', '暂无匹配的信号数据');
      }
    } catch (error: any) {
      addLog('error', `获取信号失败: ${error.message}`);
      console.error('获取信号失败:', error);
    } finally {
      setFetchingSignal(false);
    }
  };

  // 开始订阅
  const startSubscription = () => {
    if (!testAddress) {
      addLog('error', '请输入钱包地址');
      return;
    }

    if (channelRef.current) {
      addLog('info', '已存在订阅，请先停止当前订阅');
      return;
    }

    const normalizedAddress = testAddress.toLowerCase();
    addLog('info', `开始订阅地址: ${normalizedAddress}`);
    
    const channel = supabase
      .channel(`notifications:${normalizedAddress}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signal_notifications',
          filter: `wallet_address=eq.${normalizedAddress}`,
        },
        (payload) => {
          addLog('success', `🔔 收到新通知: ${payload.new.id}`);
          console.log('✅ 实时通知数据:', payload);
          
          // 添加到通知列表顶部
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          
          // 自动获取最新信号数据
          fetchLatestSignal(normalizedAddress);
        }
      )
      .subscribe((status) => {
        addLog('info', `📡 订阅状态: ${status}`);
        setSubscriptionStatus(status);
        
        if (status === 'SUBSCRIBED') {
          addLog('success', '✅ 订阅成功！正在监听新通知...');
        } else if (status === 'CHANNEL_ERROR') {
          addLog('error', '❌ 订阅失败：频道错误');
        } else if (status === 'TIMED_OUT') {
          addLog('error', '⏱️ 订阅超时');
        } else if (status === 'CLOSED') {
          addLog('info', '🔒 订阅已关闭');
        }
      });

    channelRef.current = channel;
  };

  // 停止订阅
  const stopSubscription = () => {
    if (channelRef.current) {
      addLog('info', '正在停止订阅...');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setSubscriptionStatus('未订阅');
      addLog('success', '订阅已停止');
    }
  };

  // 组件卸载时清理订阅
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // 加载历史通知
  const loadHistoryNotifications = async () => {
    if (!testAddress) {
      addLog('error', '请输入钱包地址');
      return;
    }

    setLoading(true);
    addLog('info', '正在加载历史通知...');

    try {
      const { data, error } = await supabase
        .from('signal_notifications')
        .select('*')
        .eq('wallet_address', testAddress.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setNotifications(data || []);
      addLog('success', `加载成功，找到 ${data?.length || 0} 条历史通知`);
    } catch (error: any) {
      addLog('error', `加载失败: ${error.message}`);
      console.error('查询通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 清空通知列表
  const clearNotifications = () => {
    setNotifications([]);
    addLog('info', '已清空通知列表');
  };

  // 清空日志
  const clearLogs = () => {
    setLogs([]);
    logIdRef.current = 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Supabase 实时订阅测试</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-card p-4">
          <h2 className="font-semibold text-blue-900 mb-2">测试说明</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. 输入要测试的钱包地址（默认使用当前连接的地址）</li>
            <li>2. 点击"开始订阅"建立 WebSocket 实时连接</li>
            <li>3. 订阅成功后，新通知会自动显示在下方列表中</li>
            <li>4. 可以加载历史通知查看之前的记录</li>
          </ul>
        </div>

        {/* 订阅状态 */}
        <div className="bg-white rounded-card p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">订阅状态:</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  subscriptionStatus === 'SUBSCRIBED'
                    ? 'text-green-600'
                    : subscriptionStatus === '未订阅'
                    ? 'text-gray-500'
                    : 'text-yellow-600'
                }`}
              >
                {subscriptionStatus}
              </span>
              {subscriptionStatus === 'SUBSCRIBED' && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* 地址输入 */}
        <div className="bg-white rounded-card p-4 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            测试地址
          </label>
          <input
            type="text"
            value={testAddress}
            onChange={(e) => setTestAddress(e.target.value)}
            placeholder="0x..."
            disabled={subscriptionStatus === 'SUBSCRIBED'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-2">
            {address ? '当前已连接钱包' : '请输入要测试的钱包地址'}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-3">
          {subscriptionStatus !== 'SUBSCRIBED' ? (
            <button
              onClick={startSubscription}
              disabled={!testAddress}
              className="col-span-2 bg-primary-500 text-white py-3 rounded-card font-medium
                       hover:bg-primary-600 active:bg-primary-700 transition-colors
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              开始订阅
            </button>
          ) : (
            <button
              onClick={stopSubscription}
              className="col-span-2 bg-red-500 text-white py-3 rounded-card font-medium
                       hover:bg-red-600 active:bg-red-700 transition-colors
                       flex items-center justify-center gap-2"
            >
              <Square className="w-5 h-5" />
              停止订阅
            </button>
          )}

          <button
            onClick={loadHistoryNotifications}
            disabled={loading || !testAddress}
            className="bg-blue-500 text-white py-3 rounded-card font-medium
                     hover:bg-blue-600 active:bg-blue-700 transition-colors
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              '📜'
            )}
            <span className="text-sm">加载历史</span>
          </button>

          <button
            onClick={() => fetchLatestSignal(testAddress.toLowerCase())}
            disabled={fetchingSignal || !testAddress}
            className="bg-green-500 text-white py-3 rounded-card font-medium
                     hover:bg-green-600 active:bg-green-700 transition-colors
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {fetchingSignal ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              '🎯'
            )}
            <span className="text-sm">获取信号</span>
          </button>

          <button
            onClick={clearNotifications}
            disabled={notifications.length === 0}
            className="col-span-2 bg-gray-500 text-white py-3 rounded-card font-medium
                     hover:bg-gray-600 active:bg-gray-700 transition-colors
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">清空列表</span>
          </button>
        </div>

        {/* 最新信号数据 */}
        {latestSignal && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-card border-2 border-green-200">
            <div className="px-4 py-3 border-b border-green-200 flex items-center justify-between">
              <h3 className="font-semibold text-green-900 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                最新信号数据
              </h3>
              <button
                onClick={() => setLatestSignal(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                关闭
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {latestSignal.news_title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {latestSignal.news_content}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">最终得分</div>
                  <div className="font-semibold text-green-600 text-lg">
                    {latestSignal.final_score.toFixed(2)}
                  </div>
                </div>
                {latestSignal.sentiment_score !== undefined && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-gray-500 text-xs mb-1">情感得分</div>
                    <div className="font-semibold text-blue-600 text-lg">
                      {latestSignal.sentiment_score.toFixed(2)}
                    </div>
                  </div>
                )}
                {latestSignal.relevance_score !== undefined && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-gray-500 text-xs mb-1">相关性得分</div>
                    <div className="font-semibold text-purple-600 text-lg">
                      {latestSignal.relevance_score.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {latestSignal.matched_tags && latestSignal.matched_tags.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">匹配标签</div>
                  <div className="flex flex-wrap gap-2">
                    {latestSignal.matched_tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-1">发布时间</div>
                <div className="text-sm text-gray-700">
                  {new Date(latestSignal.published_at).toLocaleString('zh-CN')}
                </div>
              </div>

              {latestSignal.news_url && (
                <a
                  href={latestSignal.news_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-500 text-white py-2 rounded-lg
                           hover:bg-blue-600 active:bg-blue-700 transition-colors text-sm font-medium"
                >
                  查看原文 →
                </a>
              )}
            </div>
          </div>
        )}

        {/* 实时通知列表 */}
        <div className="bg-white rounded-card border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              实时通知 ({notifications.length})
            </h3>
            {subscriptionStatus === 'SUBSCRIBED' && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                监听中
              </span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                {subscriptionStatus === 'SUBSCRIBED' 
                  ? '等待接收通知...' 
                  : '暂无通知，请先开始订阅或加载历史通知'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div key={notification.id} className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-500">
                        {notification.id}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <strong>
                        {notification.notification_data?.news_title || '无标题'}
                      </strong>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {notification.notification_data?.final_score && (
                        <div>评分: {notification.notification_data.final_score.toFixed(2)}</div>
                      )}
                      {notification.notification_data?.matched_tags && (
                        <div className="flex flex-wrap gap-1">
                          {notification.notification_data.matched_tags.map((tag: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 实时日志 */}
        <div className="bg-gray-900 rounded-card border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-medium text-gray-100">实时日志</h3>
            <button
              onClick={clearLogs}
              disabled={logs.length === 0}
              className="text-xs text-gray-400 hover:text-gray-200 disabled:opacity-50"
            >
              清空
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto p-4 font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-4">暂无日志</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`${
                    log.type === 'error'
                      ? 'text-red-400'
                      : log.type === 'success'
                      ? 'text-green-400'
                      : 'text-gray-300'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  <span className="text-gray-400">{log.type.toUpperCase()}:</span>{' '}
                  {log.message}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* 调试信息 */}
        <div className="bg-gray-100 rounded-card p-4">
          <h3 className="font-medium text-gray-900 mb-2">连接信息</h3>
          <div className="text-xs text-gray-600 space-y-1 font-mono">
            <div>Supabase URL: woxbgotwkbbtiaerzrqu.supabase.co</div>
            <div>Table: signal_notifications</div>
            <div>Filter: wallet_address=eq.{testAddress.toLowerCase()}</div>
            <div>Event: INSERT</div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="bg-white rounded-card p-4 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">快速操作</h3>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => {
                const channels = supabase.getChannels();
                addLog('info', `当前活跃频道数: ${channels.length}`);
                console.log('当前订阅频道:', channels);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              📋 查看所有订阅频道
            </button>
            <button
              onClick={() => {
                Notification.requestPermission().then((permission) => {
                  addLog('info', `通知权限: ${permission}`);
                });
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              🔔 请求通知权限
            </button>
            <button
              onClick={() => {
                window.open('https://woxbgotwkbbtiaerzrqu.supabase.co', '_blank');
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              🌐 打开 Supabase Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
