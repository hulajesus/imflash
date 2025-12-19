export interface AddressTag {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface AddressProfile {
  address: string;
  tags: AddressTag[];
  summary: {
    stakingBehavior?: string;
    commonProtocols?: string[];
    tradingPattern?: string;
    riskStyle?: string;
  };
}

export interface InfoFeedItem {
  id: string;
  title: string;
  content: string;
  category: string;
  relatedTags: string[];
  timestamp: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface FeedAction {
  id: string;
  action: 'like' | 'dislike' | 'close';
  timestamp: string;
}




