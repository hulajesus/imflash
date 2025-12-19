import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Loader2 } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';

// 模拟标签数据
const MOCK_TAGS = [
  { id: '1', name: 'Cross-chain', category: 'bridge' },
  { id: '2', name: 'Multi-chain', category: 'multichain' },
  { id: '3', name: 'Layer2', category: 'layer2' },
  { id: '4', name: 'Lending Liquidity', category: 'lending' },
  { id: '5', name: 'Binance', category: 'exchange' },
  { id: '6', name: 'Market Overview', category: 'market' },
  { id: '7', name: 'Market Sentiment', category: 'sentiment' },
  { id: '8', name: 'SOL', category: 'solana' },
  { id: '9', name: 'Capital Flow', category: 'capital' },
  { id: '10', name: 'Whale Activity', category: 'whale' },
];

export const TagSelection = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // 模拟分析过程
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // 切换标签选择
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const setInterestTags = useWalletStore((state) => state.setInterestTags);

  // 完成选择
  const handleComplete = () => {
    // 获取选中的标签信息
    const selectedTagsData = MOCK_TAGS.filter((tag) => selectedTags.includes(tag.id));
    
    // 保存到 store
    const tagsToStore = selectedTagsData.map((tag) => ({
      id: tag.id,
      name: tag.name,
      icon: '🏷️',
    }));
    setInterestTags(tagsToStore);
    
    console.log('用户选择的标签:', selectedTags);
    
    // 导航到地址画像
    navigate('/profile');
  };

  // 跳过选择
  const handleSkip = () => {
    navigate('/profile');
  };

  // 格式化地址
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* 分析中状态 */}
      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                正在分析链上数据
              </h2>
              <p className="text-sm text-gray-600">
                {address && formatAddress(address)}
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                <span>扫描交易历史...</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse delay-100" />
                <span>分析协议交互...</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse delay-200" />
                <span>生成行为标签...</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 标签选择状态 */
        <div className="min-h-screen pb-24">
          {/* 头部 */}
          <div className="bg-gradient-to-b from-primary-50 to-white border-b border-gray-200 px-4 py-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✨</span>
              <h1 className="text-xl font-semibold text-gray-900">
                感兴趣的标签
              </h1>
            </div>
          </div>

          {/* 标签流式布局 */}
          <div className="px-4 py-6">
            <div className="flex flex-wrap gap-x-3 gap-y-5 justify-center">
              {MOCK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`
                      relative px-6 py-3 rounded-full transition-all
                      ${
                        isSelected
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                  >
                    {/* 标签名 */}
                    <span className="text-sm font-medium whitespace-nowrap">
                      {tag.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 safe-area-bottom">
            <div className="max-w-lg mx-auto space-y-3">
              {/* 已选择提示 */}
              {selectedTags.length > 0 && (
                <p className="text-sm text-center text-gray-600">
                  已选择 {selectedTags.length} 个标签
                </p>
              )}

              {/* 完成按钮 */}
              <button
                onClick={handleComplete}
                disabled={selectedTags.length === 0}
                className={`
                  w-full py-3 rounded-xl font-medium transition-all
                  ${
                    selectedTags.length > 0
                      ? 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {selectedTags.length > 0 ? '完成选择' : '请选择一个标签'}
              </button>

              {/* 跳过按钮 */}
              <button
                onClick={handleSkip}
                className="w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                跳过
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
