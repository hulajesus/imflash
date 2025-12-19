import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { AddressProfile, InfoFeedItem } from '../types/api';
import { mockAddressProfile, mockInfoFeed, delay } from './mockData';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 是否使用 Mock 数据（当 API_BASE_URL 未设置或为开发环境时）
const USE_MOCK = !API_BASE_URL || API_BASE_URL.includes('localhost') || import.meta.env.DEV;

// 获取地址画像
export const getAddressProfile = async (address: string): Promise<AddressProfile> => {
  if (USE_MOCK) {
    await delay(800);
    return { ...mockAddressProfile, address };
  }
  try {
    const response = await apiClient.get(`/address/${address}/profile`);
    return response.data;
  } catch (error) {
    // 如果 API 失败，返回 mock 数据
    console.warn('API 请求失败，使用 mock 数据:', error);
    await delay(800);
    return { ...mockAddressProfile, address };
  }
};

// 获取地址标签
export const getAddressTags = async (address: string) => {
  if (USE_MOCK) {
    await delay(500);
    return mockAddressProfile.tags;
  }
  try {
    const response = await apiClient.get(`/address/${address}/tags`);
    return response.data;
  } catch (error) {
    console.warn('API 请求失败，使用 mock 数据:', error);
    await delay(500);
    return mockAddressProfile.tags;
  }
};

// 获取链上数据
export const getOnChainData = async (address: string) => {
  if (USE_MOCK) {
    await delay(1000);
    return {
      tokens: [],
      transactions: [],
    };
  }
  try {
    const response = await apiClient.get(`/address/${address}/onchain`);
    return response.data;
  } catch (error) {
    console.warn('API 请求失败:', error);
    return {
      tokens: [],
      transactions: [],
    };
  }
};

// 获取信息流
export const getInfoFeed = async (address: string): Promise<InfoFeedItem[]> => {
  if (USE_MOCK) {
    await delay(600);
    return mockInfoFeed;
  }
  try {
    const response = await apiClient.get(`/feed`, {
      params: { address },
    });
    return response.data;
  } catch (error) {
    console.warn('API 请求失败，使用 mock 数据:', error);
    await delay(600);
    return mockInfoFeed;
  }
};

// 信息流操作
export const submitFeedAction = async (
  feedId: string,
  action: 'like' | 'dislike' | 'close'
) => {
  if (USE_MOCK) {
    await delay(300);
    return { success: true, feedId, action };
  }
  try {
    const response = await apiClient.post(`/feed/${feedId}/action`, { action });
    return response.data;
  } catch (error) {
    console.warn('API 请求失败:', error);
    return { success: false, feedId, action };
  }
};

// 获取历史信息流
export const getHistoryFeed = async (address: string): Promise<InfoFeedItem[]> => {
  if (USE_MOCK) {
    await delay(600);
    // 返回一些历史数据
    return mockInfoFeed.map((item, index) => ({
      ...item,
      id: `history-${index}`,
      timestamp: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
    }));
  }
  try {
    const response = await apiClient.get(`/feed/history`, {
      params: { address },
    });
    return response.data;
  } catch (error) {
    console.warn('API 请求失败，使用 mock 数据:', error);
    await delay(600);
    return mockInfoFeed.map((item, index) => ({
      ...item,
      id: `history-${index}`,
      timestamp: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
    }));
  }
};

// Wallet Signals API 类型定义
export interface WalletSignal {
  id: number;
  news_event_id: number;
  created_at: string;
  model_name: string;
  summary_cn: string;
  event_type: string;
  assets: string;
  asset_names: string;
  action: string;
  direction: string;
  confidence: number;
  strength: string;
  risk_flags: string[];
  notes: string;
  scoring: {
    final_score: number;
    matched_tags: Array<{
      tag: string;
      confidence: number;
      source: string;
    }>;
  };
}

export interface WalletSignalsResponse {
  wallet_address: string;
  signals: WalletSignal[];
  metadata: {
    total_signals_checked: number;
    signals_matched: number;
    min_score_threshold: number;
  };
}

// 获取钱包信号
export const getWalletSignals = async (
  walletAddress: string,
  limit: number = 3,
  minScore: number = 0.3
): Promise<WalletSignalsResponse> => {
  try {
    // 使用 Supabase 客户端调用 Edge Function，避免 CORS 问题
    const { supabase } = await import('../config/supabase');

    const { data, error } = await supabase.functions.invoke('wallet-signals', {
      body: {
        wallet: walletAddress,
        limit,
        min_score: minScore,
        verbose: true,
      },
    });

    if (error) {
      console.error('获取钱包信号失败:', error);
      throw error;
    }

    console.log('✅ 成功获取钱包信号:', data);
    return data as WalletSignalsResponse;
  } catch (error) {
    console.error('❌ 获取钱包信号失败:', error);
    throw error;
  }
};

// 直接从数据库获取最新的钱包信号（绕过 Edge Function CORS 问题）
export const getWalletSignalsDirect = async (
  walletAddress: string
): Promise<{ summary_cn: string; created_at: string } | null> => {
  try {
    // 直接从 signal_notifications 表查询最新的通知
    const { supabase } = await import('../config/supabase');
    
    const { data, error } = await supabase
      .from('signal_notifications')
      .select('notification_data, created_at')
      .eq('wallet_address', walletAddress.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('查询钱包信号失败:', error);
      return null;
    }

    if (data && data.notification_data) {
      // 从 notification_data 中提取信号摘要
      const notificationData = data.notification_data as any;
      return {
        summary_cn: notificationData.news_title || notificationData.summary_cn || '暂无详情',
        created_at: data.created_at,
      };
    }
    
    return null;
  } catch (error) {
    console.error('直接获取钱包信号失败:', error);
    return null;
  }
};

