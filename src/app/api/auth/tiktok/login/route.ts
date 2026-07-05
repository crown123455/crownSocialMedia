import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '@/lib/settings';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get('creator_id');

  if (!creatorId) {
    return new NextResponse('Missing creator_id parameter', { status: 400 });
  }

  const clientKey = (await getSetting('TIKTOK_CLIENT_KEY')) || (await getSetting('TIKTOK_CLIENT_ID'));
  let redirectUri = await getSetting('TIKTOK_REDIRECT_URI');
  const origin = req.headers.get('origin') || `https://${req.headers.get('host') || 'localhost:3000'}`;
  if (!redirectUri || (redirectUri.includes('localhost') && !origin.includes('localhost'))) {
    redirectUri = `${origin}/api/auth/tiktok/callback`;
  }

  if (!clientKey || clientKey === 'YOUR_TIKTOK_CLIENT_KEY_HERE') {
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>إعداد TikTok Client Key</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; padding: 40px; color: #f8fafc; }
          .container { max-width: 680px; margin: 0 auto; background: #1e293b; padding: 35px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); border: 1px solid #334155; }
          h1 { color: #fe2c55; font-size: 26px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
          p { line-height: 1.8; margin-bottom: 20px; color: #cbd5e1; font-size: 16px; }
          .box { background: #0f172a; padding: 15px; border-radius: 10px; font-family: monospace; direction: ltr; text-align: left; margin: 15px 0; border-left: 4px solid #fe2c55; color: #f87171; font-size: 14px; word-break: break-all; }
          ol { padding-right: 20px; line-height: 2.2; color: #e2e8f0; }
          .btn { display: inline-block; background: linear-gradient(to right, #fe2c55, #25f4ee); color: #000; padding: 14px 28px; text-decoration: none; border-radius: 10px; margin-top: 25px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 15px rgba(254, 44, 85, 0.4); transition: 0.3s; }
          .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(254, 44, 85, 0.6); }
          .badge { background: #334155; color: #38bdf8; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎵 تفعيل الربط التلقائي لحسابات TikTok بضغطة زر!</h1>
          <p>لجعل زر <strong>TikTok Auto Connect</strong> يعمل تلقائياً ويجلب التوكن وحسابات الصناع في ثوانٍ، يجب إدخال مفتاح تطبيق تيك توك في لوحة تحكم موقعك أولاً.</p>
          
          <h3>الخطوات السريعة لتفعيل الزر التلقائي:</h3>
          <ol>
            <li>اذهب إلى <a href="https://developers.tiktok.com/" target="_blank" style="color: #38bdf8; font-weight: bold;">بوابة مطوري TikTok (TikTok for Developers)</a> وسجل دخولك وحسابك التجاري.</li>
            <li>قم بإنشاء تطبيق جديد (Create an App) واختر الصلاحيات الأساسية: <span class="badge">user.info.basic</span> و <span class="badge">video.upload</span>.</li>
            <li>في إعدادات <strong>Redirect URI</strong> داخل تطبيق تيك توك، ضع هذا الرابط بالظبط:<br>
              <div class="box">${redirectUri}</div>
            </li>
            <li>انسخ הـ <strong>Client Key</strong> والـ <strong>Client Secret</strong> من تطبيقك في تيك توك.</li>
            <li>اذهب في موقعك إلى <strong>لوحة التحكم ← إعدادات التكامل (Integrations)</strong>، والصق المفاتيح هناك، واضغط حفظ!</li>
          </ol>
          <a href="/dashboard/integrations" class="btn">الذهاب إلى لوحة الإعدادات والمفاتيح الآن 🚀</a>
        </div>
      </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const statePayload = `${creatorId}::tiktok`;
  const scope = 'user.info.basic,video.upload';
  const tiktokAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(statePayload)}`;

  return NextResponse.redirect(tiktokAuthUrl);
}
