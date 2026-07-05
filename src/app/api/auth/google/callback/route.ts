import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSetting } from '@/lib/settings';
import { encryptToken } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const creatorId = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !creatorId) {
    return NextResponse.redirect(new URL(`/dashboard/accounts?error=${encodeURIComponent(error || 'Missing callback parameters')}`, req.url));
  }

  const clientId = await getSetting('GOOGLE_CLIENT_ID');
  const clientSecret = await getSetting('GOOGLE_CLIENT_SECRET');
  let redirectUri = await getSetting('GOOGLE_REDIRECT_URI');
  const origin = req.headers.get('origin') || `https://${req.headers.get('host') || 'localhost:3000'}`;
  if (!redirectUri || (redirectUri.includes('localhost') && !origin.includes('localhost'))) {
    redirectUri = `${origin}/api/auth/google/callback`;
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange code');
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token || accessToken;
    const expiresIn = tokenData.expires_in || 3600;
    const expiryDate = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Store tokens encrypted in database
    const tokenBundle = JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryDate
    });
    const encryptedAccessToken = encryptToken(tokenBundle);
    const encryptedRefreshToken = encryptToken(refreshToken);

    // 2. Fetch YouTube Channel info
    const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const channelData = await channelRes.json();

    if (channelData.error) {
      throw new Error(channelData.error.message || 'Failed to fetch YouTube channel');
    }

    const channels = channelData.items || [];
    if (channels.length === 0) {
      throw new Error('No YouTube channel found for this Google account.');
    }

    // Ensure creator exists in Supabase table "creators" to avoid foreign key constraint violations
    try {
      const { data: creatorExists } = await supabase.from('creators').select('id').eq('id', creatorId).maybeSingle();
      if (!creatorExists) {
        await supabase.from('creators').insert([{
          id: creatorId,
          user_id: 'd7a5dff1-4e75-4f16-8e4b-dc1e7be7bf3d',
          full_name: 'صانع محتوى كراون (' + creatorId.slice(0, 6) + ')',
          display_name: 'صانع محتوى كراون',
          category: 'Business',
          country: 'United Arab Emirates',
          city: 'Dubai',
          manager_name: 'إدارة Crown',
          contract_status: 'active',
          content_package: 'full_management'
        }]);
      }
    } catch (err) {
      console.warn('Fallback creator check error:', err);
    }

    let addedCount = 0;
    for (const ch of channels) {
      const baseAccount = {
        creator_id: creatorId,
        platform: 'youtube',
        account_name: ch.snippet.title,
        username_or_channel_name: ch.snippet.customUrl || ch.snippet.title,
        account_id: ch.id,
        access_token: encryptedAccessToken,
        access_token_status: 'valid',
        permissions: ['read', 'upload', 'offline'],
        followers_count: parseInt(ch.statistics?.subscriberCount || '0', 10),
        connection_status: 'connected',
        last_sync_at: new Date().toISOString(),
      };

      // Check if account already exists by creator_id and account_id
      const { data: existing } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('creator_id', creatorId)
        .eq('account_id', ch.id)
        .maybeSingle();

      if (existing?.id) {
        const { error: updErr } = await supabase
          .from('social_accounts')
          .update(baseAccount)
          .eq('id', existing.id);
        if (updErr) {
          console.warn('Supabase update failed, redirecting with local fallback:', updErr);
          const fallbackParams = new URLSearchParams({
            success: 'oauth_local_fallback',
            platform: 'youtube',
            creator_id: creatorId,
            account_name: ch.snippet.title,
            username: ch.snippet.customUrl || ch.snippet.title,
            account_id: ch.id,
            access_token: encryptedAccessToken,
            followers_count: (ch.statistics?.subscriberCount || '0').toString()
          });
          return NextResponse.redirect(new URL(`/dashboard/accounts?${fallbackParams.toString()}`, req.url));
        }
      } else {
        const { error: insErr } = await supabase
          .from('social_accounts')
          .insert([baseAccount]);
        if (insErr) {
          console.warn('Supabase insert failed, redirecting with local fallback:', insErr);
          const fallbackParams = new URLSearchParams({
            success: 'oauth_local_fallback',
            platform: 'youtube',
            creator_id: creatorId,
            account_name: ch.snippet.title,
            username: ch.snippet.customUrl || ch.snippet.title,
            account_id: ch.id,
            access_token: encryptedAccessToken,
            followers_count: (ch.statistics?.subscriberCount || '0').toString()
          });
          return NextResponse.redirect(new URL(`/dashboard/accounts?${fallbackParams.toString()}`, req.url));
        }
      }
      addedCount++;
    }

    return NextResponse.redirect(new URL(`/dashboard/accounts?success=google_connected&count=${addedCount}`, req.url));
  } catch (err: any) {
    console.error('Google OAuth Error:', err);
    return NextResponse.redirect(new URL(`/dashboard/accounts?error=${encodeURIComponent(err.message || 'OAuth failure')}`, req.url));
  }
}
