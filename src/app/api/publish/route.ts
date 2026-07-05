import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSetting } from '@/lib/settings';
import { decryptToken, encryptToken } from '@/lib/crypto';
import fs from 'fs';
import path from 'path';

async function getValidYouTubeToken(tokenInput: string, accountId: string): Promise<string> {
  let accessToken = tokenInput;
  let refreshToken: string | null = null;
  let expiryDate: string | null = null;

  // 1. Try to decrypt token
  const decrypted = decryptToken(tokenInput);
  try {
    const bundle = JSON.parse(decrypted);
    if (bundle.access_token) accessToken = bundle.access_token;
    if (bundle.refresh_token) refreshToken = bundle.refresh_token;
    if (bundle.expiry_date) expiryDate = bundle.expiry_date;
  } catch {
    accessToken = decrypted;
  }

  // 2. If we don't have refreshToken or expiryDate from bundle, check database
  if (!refreshToken || !expiryDate) {
    const { data: ytAccounts } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('platform', 'youtube');
    
    const dbAccount = ytAccounts?.find(a => a.account_id === accountId || a.platform_account_id === accountId || a.id === accountId || ytAccounts.length === 1);

    if (dbAccount) {
      if (dbAccount.token_expires_at) expiryDate = dbAccount.token_expires_at;
      if (dbAccount.refresh_token) {
        refreshToken = decryptToken(dbAccount.refresh_token);
      } else if (dbAccount.access_token) {
        try {
          const dbBundle = JSON.parse(decryptToken(dbAccount.access_token));
          if (dbBundle.refresh_token) refreshToken = dbBundle.refresh_token;
          if (dbBundle.expiry_date && !expiryDate) expiryDate = dbBundle.expiry_date;
          if (dbBundle.access_token && !accessToken) accessToken = dbBundle.access_token;
        } catch {}
      }
    }
  }

  // 3. Check if token is expired or expiring within 5 minutes (300,000 ms)
  const isExpired = expiryDate ? new Date(expiryDate).getTime() - Date.now() < 300000 : false;

  if (isExpired && refreshToken) {
    console.log('YouTube token expired or expiring soon. Renewing automatically via refresh_token...');
    const clientId = await getSetting('GOOGLE_CLIENT_ID');
    const clientSecret = await getSetting('GOOGLE_CLIENT_SECRET'); // Secure server-side only

    if (clientId && clientSecret) {
      const renewRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      const renewData = await renewRes.json();

      if (renewData.access_token) {
        accessToken = renewData.access_token;
        const newExpiresIn = renewData.expires_in || 3600;
        const newExpiryDate = new Date(Date.now() + newExpiresIn * 1000).toISOString();

        // Save renewed token bundle back to DB
        const newBundle = JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          expiry_date: newExpiryDate,
        });
        const encryptedNewBundle = encryptToken(newBundle);

        await supabase
          .from('social_accounts')
          .update({
            access_token: encryptedNewBundle,
            access_token_status: 'valid',
          })
          .eq('account_id', accountId)
          .eq('platform', 'youtube');

        console.log('Successfully renewed and saved new YouTube token!');
      } else {
        console.error('Failed to renew YouTube token:', renewData);
      }
    }
  }

  return accessToken;
}

export async function POST(request: Request) {
  try {
    const { platform, platformAccountId, accessToken, videoUrl, mediaType, caption, postType, collaborator } = await request.json();

    if (!platform || !platformAccountId || !accessToken || !videoUrl) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const isVideo = mediaType && mediaType.startsWith('video/');

    console.log(`Publishing to ${platform} for account ${platformAccountId}...`);

    if (platform === 'instagram') {
      // Step 1: Create Media Container for Instagram
      const createUrl = `https://graph.facebook.com/v19.0/${platformAccountId}/media`;
      
      const payload: any = {
        caption: caption || '',
        access_token: accessToken
      };

      if (collaborator) {
        payload.collaborators = [collaborator];
      }

      if (isVideo) {
        payload.video_url = videoUrl;
        
        if (postType === 'STORIES') {
          payload.media_type = 'STORIES';
        } else if (postType === 'REELS') {
          payload.media_type = 'REELS';
        }
      } else {
        payload.image_url = videoUrl;
        if (postType === 'STORIES') {
          payload.media_type = 'STORIES';
        }
      }

      const createRes = await fetch(createUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const createData = await createRes.json();
      
      if (createData.error) {
        throw new Error(`IG Create Error: ${createData.error.message}`);
      }
      
      const creationId = createData.id;
      
      // Step 1.5: Poll status for video processing
      if (isVideo) {
        let isReady = false;
        let attempts = 0;
        
        while (!isReady && attempts < 15) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3 seconds
          const statusRes = await fetch(`https://graph.facebook.com/v19.0/${creationId}?fields=status_code&access_token=${accessToken}`);
          const statusData = await statusRes.json();
          
          if (statusData.status_code === 'FINISHED') {
            isReady = true;
          } else if (statusData.status_code === 'ERROR') {
            throw new Error('IG Video Error: Meta failed to process the video.');
          }
          attempts++;
        }

        if (!isReady) {
          throw new Error('IG Video Error: Timeout waiting for Meta to process the video. Try publishing later.');
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Step 2: Publish Media Container
      const publishUrl = `https://graph.facebook.com/v19.0/${platformAccountId}/media_publish`;
      const publishRes = await fetch(publishUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken
        })
      });
      const publishData = await publishRes.json();
      
      if (publishData.error) {
         throw new Error(`IG Publish Error: ${publishData.error.message}`);
      }
      
      return NextResponse.json({ 
        success: true, 
        platform_post_id: publishData.id,
        message: 'Successfully published to Instagram Reels!'
      });
    }

    if (platform === 'facebook') {
      const fbUrl = `https://graph.facebook.com/v19.0/${platformAccountId}/videos`;
      const fbRes = await fetch(fbUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url: videoUrl,
          description: caption || '',
          access_token: accessToken
        })
      });
      const fbData = await fbRes.json();
      
      if (fbData.error) {
        throw new Error(`FB Error: ${fbData.error.message}`);
      }
      
      return NextResponse.json({ 
        success: true, 
        platform_post_id: fbData.id,
        message: 'Successfully published to Facebook Page!'
      });
    }

    if (platform === 'youtube') {
      const validToken = await getValidYouTubeToken(accessToken, platformAccountId);

      console.log(`Loading video from: ${videoUrl}`);
      let videoBuffer: ArrayBuffer;
      
      try {
        if (videoUrl.startsWith('/uploads/') || !videoUrl.startsWith('http')) {
          const localPath = path.join(process.cwd(), 'public', videoUrl);
          const nodeBuffer = await fs.promises.readFile(localPath);
          videoBuffer = new Uint8Array(nodeBuffer).buffer;
        } else {
          const videoRes = await fetch(videoUrl);
          if (!videoRes.ok || !videoRes.body) {
            // Fallback: try checking if it exists locally in public/uploads/
            const fileName = videoUrl.split('/').pop();
            const localPath = path.join(process.cwd(), 'public', 'uploads', fileName || '');
            if (fs.existsSync(localPath)) {
              const nodeBuffer = await fs.promises.readFile(localPath);
              videoBuffer = new Uint8Array(nodeBuffer).buffer;
            } else {
              throw new Error(`Failed to download video from URL (${videoRes.status}): ${videoUrl}`);
            }
          } else {
            videoBuffer = await videoRes.arrayBuffer();
          }
        }
      } catch (loadErr: any) {
        throw new Error(`فشل تحميل ملف الفيديو للنشر على يوتيوب: ${loadErr.message}`);
      }

      let title = caption ? caption.split('\n')[0].slice(0, 95) : 'Crown Studio Video';
      let description = caption || '';
      if (postType === 'SHORTS') {
        if (!title.toLowerCase().includes('#shorts')) title += ' #shorts';
        if (!description.toLowerCase().includes('#shorts')) description += '\n#shorts';
      }

      // Step 1: Initiate resumable upload with YouTube Data API v3
      const initRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Length': `${videoBuffer.byteLength}`,
          'X-Upload-Content-Type': 'video/mp4',
        },
        body: JSON.stringify({
          snippet: {
            title,
            description,
            categoryId: '22',
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
          },
        }),
      });

      if (!initRes.ok) {
        const errJson = await initRes.json().catch(() => ({}));
        const errMsg = errJson.error?.message || initRes.statusText;
        if (initRes.status === 401 || initRes.status === 403) {
          throw new Error(`فشل النشر على يوتيوب (${initRes.status}): رمز الوصول (Access Token) غير صالح أو لا يحتوي على صلاحية النشر (youtube.upload). يرجى الذهاب لصفحة الحسابات وتحديث الحساب برمز صحيح.`);
        }
        throw new Error(`خطأ من يوتيوب (${initRes.status}): ${errMsg}`);
      }

      const uploadUrl = initRes.headers.get('Location');
      if (!uploadUrl) {
        throw new Error('YouTube API did not return an upload Location URL.');
      }

      // Step 2: Upload binary video content
      const uint8Video = new Uint8Array(videoBuffer);
      console.log(`Uploading ${uint8Video.byteLength} bytes to YouTube servers...`);
      
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': `${uint8Video.byteLength}`,
        },
        body: uint8Video,
      });

      const ytData = await uploadRes.json().catch(() => ({}));

      if (!uploadRes.ok || ytData.error) {
        const errDetail = ytData.error?.message || uploadRes.statusText;
        throw new Error(`فشل رفع الفيديو لسيرفرات يوتيوب (${uploadRes.status}): ${errDetail}. يرجى التأكد من صلاحية رمز الوصول (youtube.upload) وأن الحساب مؤهل لنشر مقاطع بهذا الطول.`);
      }

      return NextResponse.json({
        success: true,
        platform_post_id: ytData.id || `yt_${Date.now()}`,
        video_url: ytData.id ? `https://www.youtube.com/watch?v=${ytData.id}` : undefined,
        message: 'تم نشر الفيديو على قناة اليوتيوب بنجاح!',
      });
    }

    // TikTok fallback / simulated
    let finalCaption = caption;
    return NextResponse.json({ 
      success: true, 
      platform_post_id: `sim_${platform}_${Date.now()}`,
      message: `Published to ${platform} (Simulated). Caption used: ${finalCaption}`
    });

  } catch (error: any) {
    console.error('Publishing API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
