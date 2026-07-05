import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSetting } from '@/lib/settings';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const rawState = searchParams.get('state') || '';
  const [creatorId] = rawState.split('::');
  const error = searchParams.get('error') || searchParams.get('error_description');

  if (error || !code || !creatorId) {
    return NextResponse.redirect(new URL(`/dashboard/accounts?error=${encodeURIComponent(error || 'Missing callback parameters')}`, req.url));
  }

  const clientKey = (await getSetting('TIKTOK_CLIENT_KEY')) || (await getSetting('TIKTOK_CLIENT_ID'));
  const clientSecret = await getSetting('TIKTOK_CLIENT_SECRET');
  let redirectUri = await getSetting('TIKTOK_REDIRECT_URI');
  const origin = req.headers.get('origin') || `https://${req.headers.get('host') || 'localhost:3000'}`;
  if (!redirectUri || (redirectUri.includes('localhost') && !origin.includes('localhost'))) {
    redirectUri = `${origin}/api/auth/tiktok/callback`;
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey!,
        client_secret: clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.message || 'Failed to exchange token from TikTok');
    }

    const accessToken = tokenData.access_token;
    const openId = tokenData.open_id;

    // 2. Fetch User Profile Info
    const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const userData = await userRes.json();
    const user = userData?.data?.user || {};

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

    const tiktokAccount = {
      creator_id: creatorId,
      platform: 'tiktok',
      account_name: user.display_name || 'TikTok Creator',
      username_or_channel_name: user.display_name || openId,
      account_id: openId,
      access_token: accessToken,
      access_token_status: 'valid',
      permissions: ['read', 'publish', 'upload'],
      followers_count: user.follower_count || 0,
      connection_status: 'connected',
      last_sync_at: new Date().toISOString()
    };

    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('creator_id', creatorId)
      .eq('account_id', openId)
      .maybeSingle();

    if (existing?.id) {
      const { error: updErr } = await supabase.from('social_accounts').update(tiktokAccount).eq('id', existing.id);
      if (updErr) {
        console.warn('Supabase TikTok update failed, redirecting local:', updErr);
        const params = new URLSearchParams({
          success: 'oauth_local_fallback',
          platform: 'tiktok',
          creator_id: creatorId,
          account_name: user.display_name || 'TikTok Creator',
          username: user.display_name || openId,
          account_id: openId,
          access_token: accessToken,
          followers_count: (user.follower_count || 0).toString()
        });
        return NextResponse.redirect(new URL(`/dashboard/accounts?${params.toString()}`, req.url));
      }
    } else {
      const { error: insErr } = await supabase.from('social_accounts').insert([tiktokAccount]);
      if (insErr) {
        console.warn('Supabase TikTok insert failed, redirecting local:', insErr);
        const params = new URLSearchParams({
          success: 'oauth_local_fallback',
          platform: 'tiktok',
          creator_id: creatorId,
          account_name: user.display_name || 'TikTok Creator',
          username: user.display_name || openId,
          account_id: openId,
          access_token: accessToken,
          followers_count: (user.follower_count || 0).toString()
        });
        return NextResponse.redirect(new URL(`/dashboard/accounts?${params.toString()}`, req.url));
      }
    }

    return NextResponse.redirect(new URL(`/dashboard/accounts?success=tiktok_connected&count=1`, req.url));
  } catch (err: any) {
    console.error('TikTok OAuth Error:', err);
    return NextResponse.redirect(new URL(`/dashboard/accounts?error=${encodeURIComponent(err.message || 'Unknown TikTok Error')}`, req.url));
  }
}
