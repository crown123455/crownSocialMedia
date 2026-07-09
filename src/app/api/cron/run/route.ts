import { NextResponse } from 'next/server';
import { r2Client } from '@/lib/r2';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_BUCKET = process.env.R2_BUCKET_NAME || 'crown';
const STATE_KEY = 'database/master_state.json';

export async function GET() {
  try {
    const getCmd = new GetObjectCommand({ Bucket: R2_BUCKET, Key: STATE_KEY });
    const res = await r2Client.send(getCmd);
    const text = await res.Body?.transformToString();
    if (!text) return NextResponse.json({ success: true, publishedCount: 0 });

    const state = JSON.parse(text);
    const posts = state.posts || [];
    const targets = state.postTargets || [];

    let publishedCount = 0;
    const now = Date.now();

    posts.forEach((post: any) => {
      if (post.status === 'scheduled') {
        const schedTime = new Date(post.publish_at || post.scheduled_at || post.created_at).getTime();
        if (schedTime <= now) {
          post.status = 'published';
          publishedCount++;

          targets.forEach((t: any) => {
            if (t.post_id === post.id) {
              t.status = 'published';
            }
          });
        }
      }
    });

    if (publishedCount > 0) {
      const putCmd = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: STATE_KEY,
        Body: JSON.stringify(state),
        ContentType: 'application/json',
      });
      await r2Client.send(putCmd);
    }

    return NextResponse.json({ success: true, publishedCount });
  } catch (error: any) {
    console.error('Cron check error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
