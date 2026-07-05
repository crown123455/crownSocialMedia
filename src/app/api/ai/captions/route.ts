import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Set max duration for Vercel/Next.js to 60 seconds

export async function POST(req: NextRequest) {
  try {
    const { videoName, description, fileUri, mimeType } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || "";
    
    let filePart = null;
    let sizeWarning = '';
    
    if (fileUri) {
       filePart = {
         fileData: {
           mimeType: mimeType || 'video/mp4',
           fileUri: fileUri
         }
       };
       console.log('Using fileUri from client upload:', fileUri);
    } else {
       sizeWarning = ' (ملاحظة: لم يتم تحليل الفيديو لأنه غير مدعوم، تم كتابة الكابشن بناءً على الاسم والفكرة)';
    }

    const promptText = `اريد ان تعطيني 5 كابشن بلعامية لهاذا الفيديو مع ايموجي.
اسم الفيديو المرفوع: ${videoName || 'بدون اسم'}
الفكرة (إن وجدت): ${description || 'لا يوجد'}

أريد الرد كـ مصفوفة JSON تحتوي على 5 نصوص (Strings) فقط، ولا شيء آخر.
مثال:
[
  "يا هلا والله بالنشامى... 🔥👇",
  "شوفوا هالفيديو الناري... 🇯🇴🔥",
  "منورين دايماً... ✨",
  "أقوى محتوى... 💪",
  "لا يفوتكم... 👀"
]`;

    const parts: any[] = [];
    if (filePart) {
      parts.push(filePart);
    }
    parts.push({ text: promptText });

    console.log('Sending request to Gemini Flash 2.5...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: parts
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1000,
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('Gemini API Error:', data.error || data);
      throw new Error((data.error?.message) || 'Failed to generate captions from Gemini');
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    let captions: string[] = [];
    try {
      captions = JSON.parse(content);
      if (!Array.isArray(captions)) captions = [];
    } catch (e) {
      console.error('Failed to parse JSON captions:', e);
    }

    if (captions.length === 0) {
      captions = ["يا هلا بالنشامى، شو رأيكم بالفيديو؟ 🔥"];
    }

    if (sizeWarning && captions.length > 0) {
      captions[0] = captions[0] + sizeWarning;
    }

    return NextResponse.json({ success: true, captions });
  } catch (err: any) {
    console.error('AI Captions Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
