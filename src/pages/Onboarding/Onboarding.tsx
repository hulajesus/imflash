import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Target, Zap, Eye, Search, Shield, Lock, X } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';

export const Onboarding = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [watchAddress, setWatchAddress] = useState('');
  const [showWatchInput, setShowWatchInput] = useState(false);
  const [addressError, setAddressError] = useState('');

  // 连接成功后跳转到标签选择页面
  useEffect(() => {
    if (isConnected) {
      navigate('/tag-selection');
    }
  }, [isConnected, navigate]);

  // 处理观察钱包
  const handleWatchWallet = () => {
    console.log('[观察钱包] 开始处理，输入地址:', watchAddress);
    const trimmedAddress = watchAddress.trim();
    console.log('[观察钱包] 去除空格后:', trimmedAddress);
    
    if (!trimmedAddress) {
      console.log('[观察钱包] 地址为空');
      setAddressError('请输入钱包地址');
      return;
    }

    const isValidAddress = isAddress(trimmedAddress);
    console.log('[观察钱包] 地址验证结果:', isValidAddress);
    
    if (!isValidAddress) {
      console.log('[观察钱包] 地址无效');
      setAddressError('请输入有效的以太坊地址');
      return;
    }

    // 跳转到地址画像页面
    const targetUrl = `/profile?address=${trimmedAddress}`;
    console.log('[观察钱包] 准备跳转到:', targetUrl);
    navigate(targetUrl);
    console.log('[观察钱包] navigate 已调用');
  };

  // 处理输入变化
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWatchAddress(e.target.value);
    setAddressError('');
  };

  // 处理回车键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('[观察钱包] 回车键触发');
      handleWatchWallet();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero 区域 */}
        <div className="pt-16 pb-8 px-6 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/imflash.png" 
              alt="ImFlash Logo" 
              className="h-24 w-auto"
            />
          </div>
          
          <p className="text-gray-700 text-base max-w-md mx-auto leading-relaxed">
            基于你的链上行为与兴趣选择，智能推送与你相关的市场动态
          </p>
        </div>

        {/* 核心功能卡片 */}


        {/* 连接按钮 */}
        <div className="px-6 mb-4">
          <ConnectButton.Custom>
            {({ account, chain, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                  className="w-full"
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium text-base
                                     hover:bg-primary-600 active:scale-[0.98] transition-all duration-200
                                     flex items-center justify-center gap-2 shadow-md"
                        >
                          <span>连接钱包</span>
                        </button>
                      );
                    }

                    return null;
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* 分隔线 */}
        <div className="px-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">或</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
        </div>

        {/* 观察钱包按钮 */}
        <div className="px-6 mb-8">
          {!showWatchInput ? (
            <button
              onClick={() => setShowWatchInput(true)}
              className="w-full bg-white text-gray-700 py-3 rounded-xl font-medium text-base
                         hover:bg-gray-50 active:scale-[0.98] transition-all duration-200
                         flex items-center justify-center gap-2 shadow-sm border-2 border-gray-200"
            >
              <span>观察钱包</span>
            </button>
          ) : (
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-primary-200">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">输入钱包地址</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={watchAddress}
                    onChange={handleAddressChange}
                    onKeyDown={handleKeyDown}
                    placeholder="0x..."
                    autoComplete="off"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors
                              ${addressError 
                                ? 'border-red-300 focus:border-red-500' 
                                : 'border-gray-200 focus:border-primary-500'
                              }
                              focus:outline-none text-sm`}
                  />
                  {addressError && (
                    <p className="text-red-500 text-xs mt-2">{addressError}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleWatchWallet}
                    className="flex-1 bg-primary-500 text-white py-3 rounded-xl font-medium
                             hover:bg-primary-600 active:scale-[0.98] transition-all
                             flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>查看</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowWatchInput(false);
                      setWatchAddress('');
                      setAddressError('');
                    }}
                    className="px-4 py-3 rounded-xl font-medium text-gray-600
                             hover:bg-gray-100 active:scale-[0.98] transition-all"
                  >
                    取消
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  输入任意以太坊地址，无需连接钱包即可查看
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 功能介绍卡片 */}
        <div className="px-6 pb-8 space-y-4">
          {/* 我们将会 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-500 mb-4">
              我们将会:
            </h2>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <span className="text-gray-500 flex-1">只读分析你的链上行为</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-500 flex-1">不触碰你的资产</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-500 flex-1">不自动进行任何交易</span>
              </li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-500 mb-4">
              我们不会:
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-gray-500 flex-1">托管资产</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-500 flex-1">给出买卖指令</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-500 flex-1">承诺任何收益</span>
              </li>
            </ul>
          </div>
        </div>
        
      </div>
    </div>
  );
};




