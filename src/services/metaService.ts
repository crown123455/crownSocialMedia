import { AccountInsightsDaily, MediaInsight } from '@/types';

/**
 * Meta (Facebook & Instagram) API Adapter
 * Mock implementation ready for Supabase backend connection in Phase 5.
 */

export const metaService = {
  getPages: async (accessToken: string) => {
    // Mock response simulating Facebook Graph API /me/accounts
    return Promise.resolve([{ id: 'page_123', name: 'Mock FB Page' }]);
  },

  getInstagramBusinessAccount: async (pageId: string, accessToken: string) => {
    // Mock response for /pageId?fields=instagram_business_account
    return Promise.resolve({ id: 'ig_biz_123' });
  },

  getInstagramAccountInsights: async (igUserId: string, period: 'day' | 'week', accessToken: string): Promise<Partial<AccountInsightsDaily>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          followers: 125000,
          reach: 45000,
          impressions: 60000,
          profile_visits: 3200,
          website_clicks: 150,
          engagement_rate: 4.5
        });
      }, 800);
    });
  },

  getInstagramMedia: async (igUserId: string, accessToken: string) => {
    return Promise.resolve([
      { id: 'media_1', type: 'IMAGE' },
      { id: 'media_2', type: 'VIDEO' }
    ]);
  },

  getInstagramMediaInsights: async (mediaId: string, accessToken: string): Promise<Partial<MediaInsight>> => {
    return Promise.resolve({
      views: 12000,
      likes: 450,
      comments: 32,
      shares: 12,
      saves: 85
    });
  },

  createInstagramMediaContainer: async (payload: { igUserId: string; imageUrl?: string; videoUrl?: string; caption: string }, accessToken: string) => {
    return Promise.resolve({ container_id: 'container_abc' });
  },

  publishInstagramMedia: async (igUserId: string, creationId: string, accessToken: string) => {
    return Promise.resolve({ id: 'published_media_123' });
  },

  getPublishingLimit: async (igUserId: string, accessToken: string) => {
    return Promise.resolve({ quota_usage: 1, config: { quota_total: 25 } });
  }
};
