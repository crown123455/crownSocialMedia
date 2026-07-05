import { AccountInsightsDaily, MediaInsight } from '@/types';

/**
 * TikTok API Adapter
 */

export const tiktokService = {
  getUserProfile: async (accessToken: string) => {
    return Promise.resolve({ open_id: 'tiktok_user_123', display_name: 'Mock TikTok User' });
  },

  /**
   * Initializes video upload. Supports PULL_FROM_URL for Cloudflare R2 compatibility.
   */
  initializeVideoUpload: async (payload: { source: 'FILE_UPLOAD' | 'PULL_FROM_URL', videoUrl?: string }, accessToken: string) => {
    if (payload.source === 'PULL_FROM_URL') {
      // TikTok expects a publicly accessible URL. If domain is not verified, this might fail in real life.
      return Promise.resolve({ publish_id: 'pub_url_123', status: 'processing' });
    }
    return Promise.resolve({ upload_url: 'https://tiktok.com/upload/...', publish_id: 'pub_file_123' });
  },

  publishOrInboxFlow: async (publishId: string, accessToken: string) => {
    // Some TikTok flows require the user to open their TikTok app inbox to confirm the post.
    return Promise.resolve({ status: 'WAITING_FOR_CREATOR_ACTION', message: 'User needs to confirm in TikTok app inbox.' });
  },

  getPostStatus: async (publishId: string, accessToken: string) => {
    return Promise.resolve({ status: 'PUBLISHED', public_url: 'https://tiktok.com/@user/video/123' });
  },

  getTikTokAnalytics: async (accessToken: string): Promise<Partial<AccountInsightsDaily>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          followers: 850000,
          reach: 2000000,
          impressions: 2500000,
          profile_visits: 12000,
          engagement_rate: 15.2
        });
      }, 800);
    });
  }
};
