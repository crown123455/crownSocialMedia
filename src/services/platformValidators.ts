import { MediaAsset } from '@/types';

interface ValidationResult {
  valid: boolean;
  error?: string;
  badge?: string; // For things like "Classic Short"
}

export const platformValidators = {
  validateYouTubePost: (media: MediaAsset, postType: string): ValidationResult => {
    if (postType === 'short') {
      const isVerticalOrSquare = media.width && media.height ? (media.width <= media.height) : false;
      const duration = media.duration_seconds || 0;

      if (!isVerticalOrSquare) {
        return { valid: false, error: 'YouTube Shorts must have a vertical or square aspect ratio.' };
      }
      
      // 2026 YouTube rule: up to 3 minutes
      if (duration > 180) {
        return { valid: false, error: 'YouTube Shorts cannot exceed 3 minutes. Please use Regular Video.' };
      }

      if (duration <= 60) {
        return { valid: true, badge: 'Classic Short Length (≤ 60s)' };
      } else {
        return { valid: true, badge: '3-Minute Short Eligible (61-180s)' };
      }
    }
    
    // Regular video validation
    if (postType === 'regular' && media.mime_type.startsWith('image/')) {
      return { valid: false, error: 'YouTube Regular Video requires a video file, not an image.' };
    }
    
    return { valid: true };
  },

  validateInstagramPost: (media: MediaAsset, postType: string, hasCollaborators: boolean): ValidationResult => {
    if (postType === 'reel') {
      if (!media.mime_type.startsWith('video/')) {
        return { valid: false, error: 'Instagram Reels must be video files.' };
      }
      if ((media.duration_seconds || 0) > 90) {
        return { valid: false, error: 'Instagram Reels cannot exceed 90 seconds.' };
      }
    }

    if (postType === 'feed_image' && !media.mime_type.startsWith('image/')) {
      return { valid: false, error: 'Feed Image requires an image file.' };
    }

    if (hasCollaborators) {
      // In a real app we'd verify the API permissions allow collab
      return { valid: true, badge: 'Collab Enabled: Waiting Acceptance from collaborators upon publish.' };
    }

    return { valid: true };
  },
  
  validateCaption: (caption: string, platform: string): ValidationResult => {
    if (!caption || caption.trim() === '') {
      return { valid: false, error: 'Caption cannot be empty.' };
    }
    
    const limits: any = {
      instagram: 2200,
      facebook: 63206,
      tiktok: 2200,
      youtube: 5000 // description
    };
    
    if (caption.length > limits[platform]) {
      return { valid: false, error: `Caption exceeds ${platform} character limit of ${limits[platform]}` };
    }
    
    return { valid: true };
  }
};
