import { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';

interface NotificationToastProps {
  signalId: string;
  title: string;
  score: number;
  matchedTags: string[];
  onClose: () => void;
  autoHideDuration?: number;
}

export const NotificationToast = ({
  signalId,
  title,
  score,
  matchedTags,
  onClose,
  autoHideDuration = 5000,
}: NotificationToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 触发进入动画
    setTimeout(() => setIsVisible(true), 10);

    // 自动隐藏
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // 等待退出动画完成
  };

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-600" />
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900">与你相关的链上动态</h3>
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Signal ID */}
            <div className="mb-2">
              <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs font-mono">
                Signal ID: {signalId}
              </span>
            </div>

            {/* 标题 */}
            <p className="text-sm text-gray-700 mb-2 line-clamp-2">{title}</p>

            {/* 得分和标签 */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-600">
                得分: <span className="font-semibold text-primary-600">{score.toFixed(2)}</span>
              </span>
              {matchedTags.length > 0 && (
                <span className="text-gray-500">
                  匹配: {matchedTags.slice(0, 2).join(', ')}
                  {matchedTags.length > 2 && ` +${matchedTags.length - 2}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
