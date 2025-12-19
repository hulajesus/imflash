import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInfoFeed } from '../services/api';
import { InfoFeedItem } from '../types/api';
import { sendNewFeedNotification, requestNotificationPermission } from '../utils/notifications';

interface UseNewFeedNotificationOptions {
  address: string | undefined;
  enabled?: boolean;
  pollingInterval?: number; // 轮询间隔（毫秒）
}

/**
 * 监听新信息流并发送通知
 */
export const useNewFeedNotification = ({
  address,
  enabled = true,
  pollingInterval = 30000, // 默认 30 秒
}: UseNewFeedNotificationOptions) => {
  const previousFeedIds = useRef<Set<string>>(new Set());
  const hasInitialized = useRef(false);

  // 获取信息流
  const { data: feedItems = [] } = useQuery<InfoFeedItem[]>({
    queryKey: ['infoFeed', address],
    queryFn: () => getInfoFeed(address!),
    enabled: !!address && enabled,
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    // 首次加载时，只记录现有的 ID，不发送通知
    if (!hasInitialized.current && feedItems.length > 0) {
      previousFeedIds.current = new Set(feedItems.map(item => item.id));
      hasInitialized.current = true;
      return;
    }

    // 如果没有初始化或没有数据，跳过
    if (!hasInitialized.current || feedItems.length === 0) {
      return;
    }

    // 检测新的信息流
    const currentFeedIds = new Set(feedItems.map(item => item.id));
    const newFeedIds = feedItems
      .filter(item => !previousFeedIds.current.has(item.id))
      .map(item => item.id);

    if (newFeedIds.length > 0) {
      // 找到最新的信息
      const latestFeed = feedItems.find(item => newFeedIds.includes(item.id));
      
      // 发送通知
      sendNewFeedNotification(newFeedIds.length, latestFeed?.title);
      
      // 更新已知的 ID 列表
      previousFeedIds.current = currentFeedIds;
    }
  }, [feedItems]);

  // 组件挂载时请求通知权限
  useEffect(() => {
    if (enabled && address) {
      requestNotificationPermission();
    }
  }, [enabled, address]);

  return {
    hasPermission: 'Notification' in window && Notification.permission === 'granted',
    feedCount: feedItems.length,
  };
};
