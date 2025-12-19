// Mock 数据，用于开发和测试
import { AddressProfile, InfoFeedItem } from '../types/api';

// Mock 地址画像数据
export const mockAddressProfile: AddressProfile = {
  address: '0xA1b2C3d4E5f6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
  tags: [
    { id: '1', name: 'ETH2', category: 'staking' },
    { id: '2', name: 'Uniswap', category: 'trading' },
    { id: '3', name: '行情波动型交易', category: 'trading' },
  ],
  summary: {
    stakingBehavior: '质押行为: 32 个 ETH 质押',
    commonProtocols: ['Lido', 'Uniswap','Tokenlon'],
    tradingPattern: '交易模式: 行情波动期间操作更为频繁',
    riskStyle: '中等偏高',
  },
};

// Mock 信息流数据
let mockFeedCounter = 21; // 用于生成唯一 ID

export const mockInfoFeed: InfoFeedItem[] = [
  {
    id: '1',
    title: 'ETH 质押收益出现波动',
    content: '过去 24 小时，ETH 质押 APR 上升约 0.4%',
    category: '市场动态',
    relatedTags: ['ETH 质押'],
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'ETH 市场波动有所增强',
    content: '过去 12 小时，ETH 价格波动率较昨日提升约 18%',
    category: '市场动态',
    relatedTags: ['ETH'],
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    title: 'BTC 市场进入震荡区间',
    content: '过去 24 小时，BTC 在窄幅区间内反复波动，成交量变化不大',
    category: '市场动态',
    relatedTags: ['BTC'],
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '4',
    title: '整体市场情绪趋于谨慎',
    content: '过去 24 小时，稳定币链上流入量有所增加',
    category: '市场动态',
    relatedTags: ['稳定币'],
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: '5',
    title: '主流资产出现资金流入',
    content: '过去 6 小时，ETH 与 BTC 链上净流入金额有所上升',
    category: '市场动态',
    relatedTags: ['ETH', 'BTC'],
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: '6',
    title: 'Meme 板块交易活跃度上升',
    content: '过去 2 小时，Meme 相关代币在 DEX 的交易量明显增加',
    category: '市场动态',
    relatedTags: ['Meme 交易者'],
    timestamp: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: '7',
    title: 'Meme 交易活跃带动 Gas 上升',
    content: '过去 1 小时，以太坊网络平均 Gas 费用出现明显上涨',
    category: '市场动态',
    relatedTags: ['Gas'],
    timestamp: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: '8',
    title: '出现多笔大额链上转账',
    content: '过去 3 小时，主流资产相关的大额转账次数有所增加',
    category: '市场动态',
    relatedTags: [],
    timestamp: new Date(Date.now() - 25200000).toISOString(),
  },
  {
    id: '9',
    title: '交易所相关资金流动增加',
    content: '过去 24 小时，链上出现多笔与中心化平台相关的大额转移',
    category: '市场动态',
    relatedTags: ['交易所'],
    timestamp: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: '10',
    title: 'Layer2 网络活跃度上升',
    content: '过去 24 小时，部分 Layer2 网络交易数量明显增加',
    category: '市场动态',
    relatedTags: ['Layer2'],
    timestamp: new Date(Date.now() - 32400000).toISOString(),
  },
  {
    id: '11',
    title: '以太坊网络活跃度有所回升',
    content: '过去 24 小时，以太坊链上交易笔数较前一日有所增加',
    category: '市场动态',
    relatedTags: ['ETH'],
    timestamp: new Date(Date.now() - 36000000).toISOString(),
  },
  {
    id: '12',
    title: 'Layer2 生态使用率持续提升',
    content: '过去 7 天，多条 Layer2 网络的日均交易量保持增长',
    category: '市场动态',
    relatedTags: ['Layer2'],
    timestamp: new Date(Date.now() - 39600000).toISOString(),
  },
  {
    id: '13',
    title: '跨链桥整体使用频率上升',
    content: '过去 24 小时，主流跨链桥的资产转移次数有所增加',
    category: '市场动态',
    relatedTags: ['跨链桥'],
    timestamp: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: '14',
    title: '稳定币链上流通规模变化',
    content: '过去 48 小时，主流稳定币在多条网络上的流通量出现调整',
    category: '市场动态',
    relatedTags: ['稳定币'],
    timestamp: new Date(Date.now() - 46800000).toISOString(),
  },
  {
    id: '15',
    title: 'DeFi 总锁仓规模小幅波动',
    content: '过去 24 小时，DeFi 协议整体 TVL 出现小幅变化',
    category: '市场动态',
    relatedTags: ['DeFi'],
    timestamp: new Date(Date.now() - 50400000).toISOString(),
  },
  {
    id: '16',
    title: '借贷市场资金利用率变化',
    content: '过去 24 小时，多数借贷协议的资金使用率出现调整',
    category: '市场动态',
    relatedTags: ['DeFi', '借贷'],
    timestamp: new Date(Date.now() - 54000000).toISOString(),
  },
  {
    id: '17',
    title: '去中心化交易活跃度上升',
    content: '过去 12 小时，DEX 整体成交量较前一周期有所增长',
    category: '市场动态',
    relatedTags: ['DEX'],
    timestamp: new Date(Date.now() - 57600000).toISOString(),
  },
  {
    id: '18',
    title: '近期行业安全事件增多',
    content: '过去 7 天，公开披露的协议安全事件数量有所增加',
    category: '安全提醒',
    relatedTags: [],
    timestamp: new Date(Date.now() - 61200000).toISOString(),
  },
  {
    id: '19',
    title: '链上资金结构出现变化',
    content: '过去 24 小时，资金在主流资产与稳定币之间的流动有所增强',
    category: '市场动态',
    relatedTags: ['稳定币'],
    timestamp: new Date(Date.now() - 64800000).toISOString(),
  },
  {
    id: '20',
    title: '加密行业情绪保持观望',
    content: '近期市场参与者整体操作频率未出现明显提升',
    category: '市场动态',
    relatedTags: [],
    timestamp: new Date(Date.now() - 68400000).toISOString(),
  },
];

// 新信息流模板
const newFeedTemplates = [
  {
    title: 'DeFi 协议更新·Uniswap',
    content: 'Uniswap V4 即将上线\n新增集中流动性功能，预计 Gas 费用降低 30%',
    category: '协议更新',
    relatedTags: ['Uniswap', 'DeFi'],
  },
  {
    title: '与你相关·ETH 质押',
    content: 'Lido 质押池 TVL 突破新高\n当前 APR: 3.8%，较昨日上涨 0.3%',
    category: '与你相关',
    relatedTags: ['Lido 用户', 'ETH 质押'],
  },
  {
    title: '市场动态·Meme 板块',
    content: 'Meme 币种集体上涨\nPEPE 24h +15%, DOGE 24h +8%',
    category: '市场动态',
    relatedTags: ['Meme 交易者'],
  },
  {
    title: '安全提醒·钓鱼攻击',
    content: '近期发现新型钓鱼网站\n请注意验证网站 URL，不要点击可疑链接',
    category: '安全提醒',
    relatedTags: [],
  },
  {
    title: '与你相关·交易策略',
    content: '波动率指标显示\n当前市场适合短线交易，建议设置止损',
    category: '交易策略',
    relatedTags: ['行情波动型交易'],
  },
  {
    title: 'Gas 费用提醒',
    content: '当前 Gas 费用较低\n建议执行待处理的链上交易',
    category: '费用提醒',
    relatedTags: [],
  },
];

// 生成新的模拟信息流
export const generateNewMockFeed = (): InfoFeedItem => {
  const template = newFeedTemplates[Math.floor(Math.random() * newFeedTemplates.length)];
  const newFeed: InfoFeedItem = {
    id: String(mockFeedCounter++),
    title: template.title,
    content: template.content,
    category: template.category,
    relatedTags: template.relatedTags,
    timestamp: new Date().toISOString(),
  };
  
  // 添加到 mockInfoFeed 数组开头
  mockInfoFeed.unshift(newFeed);
  
  return newFeed;
};

// 模拟 API 延迟
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));




