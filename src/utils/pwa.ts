/**
 * PWA 和 Service Worker 工具
 */

// 注册 Service Worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('当前浏览器不支持 Service Worker');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[PWA] Service Worker 注册成功:', registration.scope);

    // 监听更新
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] 新版本可用，请刷新页面');
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker 注册失败:', error);
    return null;
  }
};

// 检查是否在 PWA 模式下运行
export const isPWA = (): boolean => {
  // iOS Safari PWA
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  // Android Chrome PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  return false;
};

// 检查是否可以安装 PWA
export const canInstallPWA = (): boolean => {
  return !isPWA() && 'serviceWorker' in navigator;
};

// 获取 Service Worker 注册对象
export const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration || null;
  } catch (error) {
    console.error('[PWA] 获取 Service Worker 注册失败:', error);
    return null;
  }
};

// 通过 Service Worker 发送通知（支持 iOS PWA）
export const sendPWANotification = async (
  title: string,
  options: NotificationOptions
): Promise<void> => {
  const registration = await getServiceWorkerRegistration();
  
  if (!registration) {
    console.warn('[PWA] Service Worker 未注册，无法发送通知');
    return;
  }

  try {
    await registration.showNotification(title, options);
    console.log('[PWA] 通知已发送');
  } catch (error) {
    console.error('[PWA] 发送通知失败:', error);
  }
};

// 检查通知权限并请求（PWA 模式）
export const requestPWANotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('[PWA] 浏览器不支持通知');
    return 'denied';
  }

  // 如果已经授权，直接返回
  if (Notification.permission === 'granted') {
    return 'granted';
  }

  // 如果未拒绝，请求权限
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('[PWA] 请求通知权限失败:', error);
      return 'denied';
    }
  }

  return Notification.permission;
};

// iOS PWA 安装指南
export const getIOSPWAInstallSteps = () => [
  {
    step: 1,
    title: '打开 Safari 浏览器',
    description: '在 iOS 设备上使用 Safari 浏览器访问本应用',
  },
  {
    step: 2,
    title: '点击分享按钮',
    description: '点击底部工具栏中间的"分享"图标（方框带向上箭头）',
  },
  {
    step: 3,
    title: '添加到主屏幕',
    description: '在弹出菜单中向下滚动，找到并点击"添加到主屏幕"',
  },
  {
    step: 4,
    title: '确认添加',
    description: '可以修改应用名称，然后点击右上角"添加"按钮',
  },
  {
    step: 5,
    title: '从主屏幕启动',
    description: '返回主屏幕，点击新添加的图标启动应用，即可接收通知',
  },
];
