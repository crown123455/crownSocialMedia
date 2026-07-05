export type MediaStatus = 'raw' | 'edited' | 'approved' | 'scheduled' | 'published' | 'archived';
export type PostStatus = 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'publishing' | 'published' | 'partially_published' | 'failed' | 'cancelled';
export type PlatformPostStatus = 'pending' | 'published' | 'failed' | 'waiting_acceptance'; // waiting_acceptance for TikTok/Collab

export interface MediaAsset {
  id: string;
  creator_id: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  duration_seconds?: number;
  width?: number;
  height?: number;
  aspect_ratio?: string;
  r2_key?: string;
  public_url?: string; // or local object URL for preview
  status: MediaStatus;
  tags: string[];
  uploaded_by: string;
  created_at: string;
}

export interface Post {
  id: string;
  creator_id: string;
  media_asset_ids: string[];
  media_url?: string;
  media_type?: string;
  global_caption: string;
  status: PostStatus;
  publish_at?: string;
  timezone?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PostTarget {
  id: string;
  post_id: string;
  social_account_id: string;
  platform: string;
  post_type: string; // e.g., 'reel', 'short', 'feed'
  custom_caption?: string;
  platform_post_id?: string;
  public_url?: string;
  status: PlatformPostStatus;
  error_message?: string;
  collaborator_usernames?: string[]; // for IG Collab
}

export interface PostApproval {
  id: string;
  post_id: string;
  reviewer_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
}
