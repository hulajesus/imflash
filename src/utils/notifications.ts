/**
 * 浏览器通知工具
 */

import { supportsNotifications } from './platform';
import { isPWA, sendPWANotification } from './pwa';

// 请求通知权限
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!supportsNotifications()) {
    console.warn('当前环境不支持通知');
    return 'denied';
  }

  if (!('Notification' in window)) {
    console.warn('此浏览器不支持桌面通知');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

// 检查通知权限
export const checkNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

// 发送通知
export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
}

export const sendNotification = async (options: NotificationOptions): Promise<Notification | null> => {
  console.log('[通知] 开始发送通知流程');
  
  if (!supportsNotifications()) {
    console.warn('[通知] 当前环境不支持通知');
    return null;
  }

  if (!('Notification' in window)) {
    console.warn('[通知] 此浏览器不支持桌面通知');
    return null;
  }

  const permission = Notification.permission;
  console.log('[通知] 当前权限状态:', permission);
  
  if (permission !== 'granted') {
    console.warn('[通知] 没有通知权限，当前状态:', permission);
    // 尝试请求权限
    if (permission === 'default') {
      console.log('[通知] 尝试请求通知权限');
      const newPermission = await Notification.requestPermission();
      console.log('[通知] 权限请求结果:', newPermission);
      if (newPermission !== 'granted') {
        return null;
      }
    } else {
      return null;
    }
  }

  const {
    title,
    body,
    icon = '/icon-192.png',
    badge = '/icon-192.png',
    tag,
    data,
    requireInteraction = false,
    silent = false,
  } = options;

  const pwaMode = isPWA();
  console.log('[通知] PWA 模式:', pwaMode);
  console.log('[通知] 准备发送:', { title, body });

  // 在生产环境且 PWA 模式下，尝试使用 Service Worker
  if (pwaMode && import.meta.env.PROD) {
    console.log('[通知] 尝试通过 Service Worker 发送通知');
    try {
      await sendPWANotification(title, {
        body,
        icon,
        badge,
        tag,
        data,
        requireInteraction,
        silent,
      });
      console.log('[通知] Service Worker 通知发送成功');
      return null;
    } catch (error) {
      console.error('[通知] Service Worker 发送失败，降级到 Notification API:', error);
      // 继续执行下面的代码，降级到普通通知
    }
  }

  // 使用 Notification API（开发环境或 Service Worker 失败时）
  try {
    console.log('[通知] 使用 Notification API 发送通知');
    const notification = new Notification(title, {
      body,
      icon,
      badge,
      tag,
      data,
      requireInteraction,
      silent,
    });

    console.log('[通知] Notification API 通知创建成功');

    // 点击通知时聚焦窗口
    notification.onclick = () => {
      console.log('[通知] 通知被点击');
      window.focus();
      notification.close();
    };

    // 监听通知显示
    notification.onshow = () => {
      console.log('[通知] 通知已显示');
    };

    // 监听通知错误
    notification.onerror = (error) => {
      console.error('[通知] 通知显示错误:', error);
    };

    return notification;
  } catch (error) {
    console.error('[通知] Notification API 发送失败:', error);
    return null;
  }
};

// 发送新信息流通知
export const sendNewFeedNotification = (count: number, latestTitle?: string) => {
  const title = '新的市场信息';
  const body = latestTitle 
    ? `${latestTitle}` 
    : `你有 ${count} 条新的个性化信息`;

  return sendNotification({
    title,
    body,
    tag: 'new-feed', // 使用相同的 tag 会替换之前的通知
    requireInteraction: false,
  });
};
