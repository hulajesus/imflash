export interface SignalNotification {
  id: string;
  wallet_address: string;
  notification_data: {
    news_title: string;
    final_score: number;
    matched_tags: string[];
    content?: string;
    category?: string;
    timestamp?: string;
  };
  created_at: string;
}
