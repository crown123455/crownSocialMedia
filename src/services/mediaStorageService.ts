import { MediaAsset } from '@/types';

/**
 * Cloudflare R2 Mock Adapter
 * This architecture is designed to easily plug into an R2 presigned URL backend.
 */
export const mediaStorageService = {
  createPresignedUploadUrl: async (fileMeta: { name: string; size: number; type: string }): Promise<{ url: string; assetId: string }> => {
    // In Phase 5, this will call a Next.js API route that generates an R2 Signed URL
    const assetId = `media_${Date.now()}`;
    return Promise.resolve({ url: 'mock_presigned_url', assetId });
  },

  completeUpload: async (assetId: string): Promise<{ publicUrl: string }> => {
    // In Phase 5, this verifies upload and returns the public R2 domain URL
    return Promise.resolve({ publicUrl: `https://mock.crown-r2.com/${assetId}` });
  },

  validateFileBeforeUpload: (file: File): { valid: boolean; error?: string } => {
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) return { valid: false, error: 'File size exceeds 500MB limit.' };
    
    const validTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'];
    if (!validTypes.includes(file.type)) return { valid: false, error: 'Unsupported file type. Use JPG, PNG, MP4, or MOV.' };
    
    return { valid: true };
  },

  /**
   * Helper to extract mock duration and dimensions for the UI
   */
  extractMetadataLocal: (file: File): Promise<{ duration_seconds?: number; width?: number; height?: number }> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({ duration_seconds: video.duration, width: video.videoWidth, height: video.videoHeight });
          URL.revokeObjectURL(url);
        };
        video.src = url;
      } else if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
          URL.revokeObjectURL(url);
        };
        img.src = url;
      } else {
        resolve({});
      }
    });
  }
};
