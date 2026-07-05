import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '@/lib/settings';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get('creator_id');

  if (!creatorId) {
    return new NextResponse('Missing creator_id parameter', { status: 400 });
  }

  const clientId = await getSetting('META_CLIENT_ID');
  let redirectUri = await getSetting('META_REDIRECT_URI');
  const origin = req.headers.get('origin') || `https://${req.headers.get('host') || 'localhost:3000'}`;
  if (!redirectUri || (redirectUri.includes('localhost') && !origin.includes('localhost'))) {
    redirectUri = `${origin}/api/auth/meta/callback`;
  }

  if (!clientId || clientId === 'YOUR_META_CLIENT_ID_HERE') {
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>إعداد Meta Client ID</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; padding: 40px; color: #f8fafc; }
          .container { max-w: 650px; margin: 0 auto; background: #1e293b; padding: 35px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); border: 1px solid #334155; }
          h1 { color: #60a5fa; font-size: 24px; margin-bottom: 16px; display: flex; items-center; gap: 10px; }
          p { line-height: 1.6; margin-bottom: 20px; color: #cbd5e1; font-size: 16px; }
          .box { background: #0f172a; padding: 15px; border-radius: 8px; font-family: monospace; direction: ltr; text-align: left; margin: 15px 0; border-left: 4px solid #3b82f6; color: #38bdf8; font-size: 14px; word-break: break-all; }
          ol { padding-right: 20px; line-height: 2; color: #e2e8f0; }
          .btn { display: inline-block; background: linear-gradient(to right, #3b82f6, #2563eb); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5); transition: 0.2s; }
          .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.7); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚡ خطوة واحدة متبقية لتفعيل الربط التلقائي لـ Instagram / Facebook!</h1>
          <p>أنت الآن تحاول الربط المباشر، ولكن لم تقم بعد بإدخال مفتاح التطبيق (App ID & Secret) الخاص بـ Meta في لوحة التحكم.</p>
          
          <h3>الخطوات السريعة:</h3>
          <ol>
            <li>اذهب إلى <a href="https://developers.facebook.com/apps/" target="_blank" style="color: #60a5fa; font-weight: bold;">لوحة Meta for Developers</a> وقم بإنشاء تطبيق (نوع Business).</li>
            <li>أضف منتج <strong>Instagram Login for Business</strong> أو <strong>Facebook Login for Business</strong>.</li>
            <li>في إعدادات الـ Redirect URI داخل لوحة ميتا، ضع هذا الرابط بالظبط:<br>
              <div class="box">${redirectUri}</div>
            </li>
            <li>انسخ الـ <strong>App ID</strong> والـ <strong>App Secret</strong> من إعدادات التطبيق (Basic Settings).</li>
            <li>اذهب الآن في موقعك إلى <strong>لوحة التحكم ← إعدادات التكامل (Integrations & API Keys)</strong>، والصق المفاتيح هناك، واضغط حفظ! ستحفظ مباشرة في Supabase والسيرفر!</li>
          </ol>
          <a href="/dashboard/integrations" class="btn">الذهاب إلى لوحة إعدادات التكامل ومفاتيح الربط الآن 🚀</a>
        </div>
      </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const filter = searchParams.get('filter') || 'all';
  const statePayload = `${creatorId}::${filter}`;

  const scope = 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts';
  const metaAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(statePayload)}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(metaAuthUrl);
}
