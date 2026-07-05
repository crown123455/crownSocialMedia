export type ContractStatus = 'lead' | 'active' | 'paused' | 'cancelled';
export type ContentPackage = 'shooting_only' | 'editing_only' | 'publishing_only' | 'full_management';
export type Platform = 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'linkedin';
export type ConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'failed' | 'expired' | 'revoked' | 'error';
export type AccessTokenStatus = 'missing' | 'valid' | 'expired' | 'needs_review' | 'permission_error';

export interface Creator {
  id: string;
  full_name: string;
  display_name: string;
  profile_photo?: string;
  category: 'Fashion' | 'Fitness' | 'Food' | 'Education' | 'Gaming' | 'Lifestyle' | 'Business' | 'Other';
  country: string;
  city: string;
  manager_name: string;
  manager_phone: string;
  manager_email: string;
  contract_status: ContractStatus;
  content_package: ContentPackage;
  monthly_content_target: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  creator_id: string;
  platform: Platform;
  account_name: string;
  username_or_channel_name: string;
  platform_account_id: string;
  page_id?: string; // If Meta
  instagram_business_account_id?: string; // If Instagram
  access_token?: string;
  refresh_token?: string;
  access_token_status: AccessTokenStatus;
  permissions: string[];
  profile_picture_url?: string;
  followers_count: number;
  connection_status: ConnectionStatus;
  last_sync_at?: string;
  token_expires_at?: string;
  notes?: string;
}

export type TeamRole = 'Owner' | 'Admin' | 'Editor' | 'Publisher' | 'Analyst' | 'Client Viewer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_name: string;
  action: string;
  resource: string;
  status: 'Success' | 'Failed';
  timestamp: string;
}

export * from './analytics';
export * from './publishing';

