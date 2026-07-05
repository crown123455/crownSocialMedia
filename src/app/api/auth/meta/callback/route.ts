import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSetting } from '@/lib/settings';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const rawState = searchParams.get('state') || '';
  const [creatorId, filter = 'all'] = rawState.split('::');
  const error = searchParams.get('error');

  if (error || !code || !creatorId) {
    return NextResponse.redirect(new URL(`/dashboard/accounts?error=${encodeURIComponent(error || 'Missing callback parameters')}`, req.url));
  }

  const clientId = await getSetting('META_CLIENT_ID');
  const clientSecret = await getSetting('META_CLIENT_SECRET');
  let redirectUri = await getSetting('META_REDIRECT_URI');
  const origin = req.headers.get('origin') || `https://${req.headers.get('host') || 'localhost:3000'}`;
  if (!redirectUri || (redirectUri.includes('localhost') && !origin.includes('localhost'))) {
    redirectUri = `${origin}/api/auth/meta/callback`;
  }

  try {
    // 1. Exchange code for short-lived token
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message || 'Failed to exchange code');
    }

    const shortToken = tokenData.access_token;

    // 2. Exchange short-lived token for long-lived token
    const longTokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortToken}`);
    const longTokenData = await longTokenRes.json();
    const accessToken = longTokenData.access_token || shortToken;

    // 3. Fetch connected pages and Instagram Business accounts
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,picture.type(large){url},followers_count,fan_count,instagram_business_account{id,username,profile_picture_url,followers_count}&access_token=${accessToken}`);
    const pagesData = await pagesRes.json();

    if (pagesData.error) {
      throw new Error(pagesData.error.message || 'Failed to fetch Meta pages');
    }

    const pages = pagesData.data || [];

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

    for (const page of pages) {
      // Add Facebook Page if filter is 'facebook' or 'all'
      if (filter === 'facebook' || filter === 'all') {
        const fbAccount = {
          creator_id: creatorId,
          platform: 'facebook',
          account_name: page.name,
          username_or_channel_name: page.name,
          account_id: page.id,
          access_token: page.access_token || accessToken,
          access_token_status: 'valid',
          permissions: ['read', 'publish'],
          followers_count: page.followers_count || page.fan_count || 0,
          connection_status: 'connected',
          last_sync_at: new Date().toISOString()
        };

        const { data: existingFb } = await supabase
          .from('social_accounts')
          .select('id')
          .eq('creator_id', creatorId)
          .eq('account_id', page.id)
          .maybeSingle();

        if (existingFb?.id) {
          const { error: updErr } = await supabase.from('social_accounts').update(fbAccount).eq('id', existingFb.id);
          if (updErr) {
            console.warn('Supabase FB update failed, redirecting local:', updErr);
            const params = new URLSearchParams({
              success: 'oauth_local_fallback',
              platform: 'facebook',
              creator_id: creatorId,
              account_name: page.name,
              username: page.name,
              account_id: page.id,
              access_token: page.access_token || accessToken,
              followers_count: (page.followers_count || page.fan_count || 0).toString()
            });
            return NextResponse.redirect(new URL(`/dashboard/accounts?${params.toString()}`, req.url));
          }
        } else {
          const { error: insErr } = await supabase.from('social_accounts').insert([fbAccount]);
          if (insErr) {
            console.warn('Supabase FB insert failed, redirecting local:', insErr);
            const params = new URLSearchParams({
              success: 'oauth_local_fallback',
              platform: 'facebook',
              creator_id: creatorId,
              account_name: page.name,
              username: page.name,
              account_id: page.id,
              access_token: page.access_token || accessToken,
              followers_count: (page.followers_count || page.fan_count || 0).toString()
            });
            return NextResponse.redirect(new URL(`/dashboard/accounts?${params.toString()}`, req.url));
          }
        }
        addedCount++;
      }

      // Add Instagram Business Account if linked AND filter is 'instagram' or 'all'
      if (page.instagram_business_account && (filter === 'instagram' || filter === 'all')) {
        const ig = page.instagram_business_account;
        const igAccount = {
          creator_id: creatorId,
          platform: 'instagram',
          account_name: ig.username || page.name,
          username_or_channel_name: `@${ig.username}`,
          account_id: ig.id,
          access_token: page.access_token || accessToken,
          access_token_status: 'valid',
          permissions: ['read', 'publish'],
          followers_count: ig.followers_count || 0,
          connection_status: 'connected',
          last_sync_at: new Date().toISOString()
        };

        const { data: existingIg } = await supabase
          .from('social_accounts')
          .select('id')
          .eq('creator_id', creatorId)
          .eq('account_id', ig.id)
          .maybeSingle();

        if (existingIg?.id) {
          const { error: updErr } = await supabase.from('social_accounts').update(igAccount).eq('id', existingIg.id);
          if (updErr) {
            console.warn('Supabase IG update failed, redirecting local:', updErr);
            const params = new URLSearchParams({
              success: 'oauth_local_fallback',
              platform: 'instagram',
              creator_id: creatorId,
              account_name: ig.username || page.name,
              username: `@${ig.username}`,
              account_id: ig.id,
              access_token: page.access_token || accessToken,
              followers_count: (ig.followers_count || 0).toString()
            });
            return NextResponse.redirect(new URL(`/dashboard/accounts?${params.toString()}`, req.url));
          }
        } else {
          const { error: insErr } = await supabase.from('social_accounts').insert([igAccount]);
          if (insErr) {
            console.warn('Supabase IG insert failed, redirecting local:', insErr);
            const params = new URLSearchParams({
              success: 'oauth_local_fallback',
              platform: 'instagram',
              creator_id: creatorId,
              account_name: ig.username || page.name,
              username: `@${ig.username}`,
              account_id: ig.id,
              access_token: page.access_token || accessToken,
              followers_count: (ig.followers_count || 0).toString()
            });
            return NextResponse.redirect(new URL(`/dashboard/accounts?${params.toString()}`, req.url));
          }
        }
        addedCount++;
      }
    }

    if (addedCount === 0) {
      const errMsg = filter === 'instagram' 
        ? 'لم يتم العثور على حساب إنستقرام تجاري مربوط! يجب أن يكون حسابك في إنستقرام (حساب أعمال Business أو احترافي Creator) ويجب ربطه بصفحة فيسبوك أولاً.' 
        : 'لم يتم العثور على صفحات فيسبوك! تأكد أنك تملك صفحة فيسبوك وأنك حددت كل الصفحات أثناء نافذة الموافقة.';
      return NextResponse.redirect(new URL(`/dashboard/accounts?error=${encodeURIComponent(errMsg)}`, req.url));
    }

    return NextResponse.redirect(new URL(`/dashboard/accounts?success=meta_connected&count=${addedCount}`, req.url));
  } catch (err: any) {
    console.error('Meta OAuth Error:', err);
    return NextResponse.redirect(new URL(`/dashboard/accounts?error=${encodeURIComponent(err.message || 'OAuth failure')}`, req.url));
  }
}
