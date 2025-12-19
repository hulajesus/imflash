/**
 * 平台检测工具
 */

// 检测是否为 iOS 设备
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

// 检测是否为 Safari 浏览器
export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// 检测是否为 iOS Safari
export const isIOSSafari = (): boolean => {
  return isIOS() && isSafari();
};

// 检测是否为 PWA 模式（已安装到主屏幕）
export const isStandalone = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

// 检测是否支持通知
export const supportsNotifications = (): boolean => {
  if (!('Notification' in window)) {
    return false;
  }

  // iOS Safari 只在 PWA 模式下支持通知
  if (isIOSSafari() && !isStandalone()) {
    return false;
  }

  return true;
};

// 获取平台信息
export const getPlatformInfo = () => {
  return {
    isIOS: isIOS(),
    isSafari: isSafari(),
    isIOSSafari: isIOSSafari(),
    isStandalone: isStandalone(),
    supportsNotifications: supportsNotifications(),
    userAgent: navigator.userAgent,
  };
};

// 获取平台名称
export const getPlatformName = (): string => {
  if (isIOS()) {
    return isStandalone() ? 'iOS PWA' : 'iOS Safari';
  }
  if (/Android/.test(navigator.userAgent)) {
    return 'Android';
  }
  if (/Mac/.test(navigator.userAgent)) {
    return 'macOS';
  }
  if (/Win/.test(navigator.userAgent)) {
    return 'Windows';
  }
  return 'Unknown';
};
