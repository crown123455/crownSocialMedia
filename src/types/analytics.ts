export type DataSource = 'api' | 'cached' | 'demo' | 'unavailable';

export interface AnalyticsSnapshot {
  id: string;
  workspace_id: string;
  creator_id: string;
  social_account_id?: string;
  platform: 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'aggregated';
  metric_name: string;
  metric_value: number;
  metric_change_percentage?: number;
  date: string;
  source: DataSource;
  fetched_at: string;
}

export interface AccountInsightsDaily {
  id: string;
  social_account_id: string;
  date: string;
  followers: number;
  reach: number;
  impressions: number;
  profile_visits: number;
  website_clicks: number;
  engagement_rate: number;
}

export interface MediaInsight {
  id: string;
  social_account_id: string;
  media_id: string; // ID from the platform
  media_type: 'image' | 'video' | 'reel' | 'carousel' | 'short';
  published_at: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  watch_time_hours?: number; // YouTube specific
  average_view_duration_seconds?: number; // YouTube specific
}

export interface SyncJob {
  id: string;
  social_account_id: string;
  platform: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  started_at: string;
  completed_at?: string;
  records_fetched: number;
  error_message?: string;
}

export interface ApiError {
  id: string;
  social_account_id: string;
  endpoint: string;
  error_code: string;
  error_message: string;
  timestamp: string;
  resolved: boolean;
}

export interface ConnectionHealth {
  status: 'connected' | 'expiring_soon' | 'expired' | 'missing_permissions' | 'app_review_required' | 'rate_limited' | 'api_error' | 'unsupported_account_type';
  message: string;
  last_checked: string;
  action_required?: 'reconnect' | 'view_error' | 'request_review' | 'wait';
}
