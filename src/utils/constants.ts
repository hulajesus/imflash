export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const WALLET_NETWORKS = {
  ethereum: 1,
  arbitrum: 42161,
  polygon: 137,
} as const;

export const NETWORK_NAMES: Record<number, string> = {
  1: 'Ethereum',
  42161: 'Arbitrum',
  137: 'Polygon',
};




