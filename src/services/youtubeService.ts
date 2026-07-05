import { AccountInsightsDaily, MediaInsight } from '@/types';

/**
 * YouTube Data API v3 Adapter
 */

export const youtubeService = {
  getChannelProfile: async (channelId: string, accessToken: string) => {
    return Promise.resolve({ id: channelId, title: 'Mock Channel', subscriberCount: 50000 });
  },

  getChannelAnalytics: async (channelId: string, dateRange: { startDate: string, endDate: string }, accessToken: string): Promise<Partial<AccountInsightsDaily>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          followers: 50000,
          reach: 120000,
          impressions: 250000,
          engagement_rate: 6.2
        });
      }, 800);
    });
  },

  listVideos: async (channelId: string, accessToken: string) => {
    return Promise.resolve([
      { id: 'vid_1', title: 'Vlog 1', duration: 'PT5M30S' },
      { id: 'vid_2', title: 'Shorts 1', duration: 'PT45S' }
    ]);
  },

  getVideoStats: async (videoId: string, accessToken: string): Promise<Partial<MediaInsight>> => {
    return Promise.resolve({
      views: 85000,
      likes: 4200,
      comments: 310,
      watch_time_hours: 4500,
      average_view_duration_seconds: 180
    });
  },

  /**
   * Helper to determine if a video is a Short based on 2026 YouTube rules.
   * Rule: Vertical or Square aspect ratio AND under 3 minutes.
   */
  isShort: (durationSeconds: number, isVerticalOrSquare: boolean): boolean => {
    return isVerticalOrSquare && durationSeconds <= 180;
  },

  prepareUploadMetadata: (payload: { title: string, description: string, tags: string[], categoryId: string, privacyStatus: string }) => {
    return {
      snippet: { title: payload.title, description: payload.description, tags: payload.tags, categoryId: payload.categoryId },
      status: { privacyStatus: payload.privacyStatus }
    };
  },

  uploadVideoWithResumableProtocol: async (file: File, metadata: any, accessToken: string) => {
    // Simulating multipart/resumable upload
    return Promise.resolve({ id: 'new_video_id', status: 'uploaded' });
  }
};
