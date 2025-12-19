import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { SignalNotification } from '../types/supabase';
import { useQueryClient } from '@tanstack/react-query';

interface UseSupabaseNotificationsOptions {
  walletAddress?: string;
  enabled?: boolean;
  onNotification?: (notification: SignalNotification) => void;
  showBrowserNotification?: boolean;
}

export const useSupabaseNotifications = ({
  walletAddress,
  enabled = true,
  onNotification,
  showBrowserNotification = true,
}: UseSupabaseNotificationsOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onNotificationRef = useRef(onNotification);
  const queryClient = useQueryClient();
  const isSubscribedRef = useRef(false);

  // 保持 onNotification 引用最新
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    // 如果条件不满足或已经订阅，不重复订阅
    if (!walletAddress || !enabled) {
      return;
    }

    // 防止重复订阅
    if (isSubscribedRef.current && channelRef.current) {
      console.log('⚠️ 已存在订阅，跳过重复订阅');
      return;
    }

    console.log('🔔 开始订阅 Supabase 通知:', walletAddress);
    isSubscribedRef.current = true;

    // 定期检查通知统计信息
    const checkNotificationStats = async () => {
      try {
        const { data, error } = await supabase
          .from('signal_notifications')
          .select('id, created_at')
          .eq('wallet_address', walletAddress)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ 查询通知统计失败:', error);
          return;
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
        
        console.log(`[${timeStr}] 定期检查中... (等待新通知)`);
        console.log(`📊 当前该钱包地址的通知总数: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          console.log(`📅 最新通知时间: ${data[0].created_at}`);
        } else {
          console.log('📅 暂无通知记录');
        }
      } catch (err) {
        console.error('❌ 检查通知统计时出错:', err);
      }
    };

    // 立即执行一次检查
    checkNotificationStats();

    // 每 30 秒检查一次
    const statsInterval = setInterval(checkNotificationStats, 30000);

    // 创建订阅频道
    const channel = supabase
      .channel(`notifications:${walletAddress}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signal_notifications',
          filter: `wallet_address=eq.${walletAddress}`,
        },
        (payload) => {
          const notification = payload.new as SignalNotification;
          const data = notification.notification_data;

          console.log('═══════════════════════════════════════');
          console.log('🔔 收到新的 Supabase 通知！');
          console.log('═══════════════════════════════════════');
          console.log('📋 Signal ID:', notification.id);
          console.log('📰 新闻标题:', data.news_title);
          console.log('📊 得分:', data.final_score);
          console.log('🏷️  匹配标签:', data.matched_tags);
          console.log('⏰ 创建时间:', notification.created_at);
          console.log('📦 完整数据:', JSON.stringify(notification, null, 2));
          console.log('═══════════════════════════════════════');

          // 调用回调函数（使用 ref 避免闭包问题）
          if (onNotificationRef.current) {
            onNotificationRef.current(notification);
          }

          // 刷新信息流数据
          queryClient.invalidateQueries({ queryKey: ['infoFeed', walletAddress] });

          // 显示浏览器通知
          if (showBrowserNotification && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification('与你相关的链上动态', {
                body: `${data.news_title} (得分: ${data.final_score.toFixed(2)})`,
                icon: '/Symble_Square.png',
                badge: '/Symble_Square.png',
                tag: notification.id,
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                  new Notification('与你相关的链上动态', {
                    body: `${data.news_title} (得分: ${data.final_score.toFixed(2)})`,
                    icon: '/Symble_Square.png',
                    badge: '/Symble_Square.png',
                    tag: notification.id,
                  });
                }
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Supabase 订阅状态:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ 成功订阅通知，正在监听钱包地址:', walletAddress);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ 订阅失败：频道错误');
          isSubscribedRef.current = false;
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ 订阅超时');
          isSubscribedRef.current = false;
        } else if (status === 'CLOSED') {
          console.log('🔒 订阅已关闭');
          isSubscribedRef.current = false;
        }
      });

    channelRef.current = channel;

    // 清理函数
    return () => {
      console.log('🔕 清理订阅:', walletAddress);
      
      // 清理定时器
      if (statsInterval) {
        clearInterval(statsInterval);
      }
      
      // 清理订阅频道
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      isSubscribedRef.current = false;
    };
  }, [walletAddress, enabled, showBrowserNotification, queryClient]);

  return {
    unsubscribe: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    },
  };
};
