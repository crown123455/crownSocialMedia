import { NextResponse } from 'next/server';
import { r2Client } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const R2_BUCKET = process.env.R2_BUCKET_NAME || 'crown';
const STATE_KEY = 'database/master_state.json';

export async function POST() {
  try {
    const cleanState = {
      creators: [],
      accounts: [],
      posts: [],
      postTargets: [],
      creatorSchedules: {},
      media: [],
      updated_at: new Date().toISOString(),
      formatted: true
    };

    const cmd = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: STATE_KEY,
      Body: JSON.stringify(cleanState, null, 2),
      ContentType: 'application/json'
    });

    await r2Client.send(cmd);

    return NextResponse.json({
      success: true,
      message: 'تم فرمتة وإعادة تهيئة قاعدة البيانات بنجاح!'
    });
  } catch (err: any) {
    console.error('Reset DB error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
