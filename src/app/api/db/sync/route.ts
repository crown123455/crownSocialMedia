import { NextRequest, NextResponse } from 'next/server';
import { r2Client } from '@/lib/r2';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { supabase } from '@/lib/supabase';

const R2_BUCKET = process.env.R2_BUCKET_NAME || 'crown';
const STATE_KEY = 'database/master_state.json';

// Helper to get state from Cloudflare R2
async function getR2State(): Promise<any> {
  try {
    const cmd = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: STATE_KEY,
    });
    const res = await r2Client.send(cmd);
    const text = await res.Body?.transformToString();
    if (text) {
      return JSON.parse(text);
    }
  } catch (err: any) {
    // If file doesn't exist yet, return empty object
  }
  return null;
}

// Helper to save state to Cloudflare R2
async function saveR2State(state: any): Promise<boolean> {
  try {
    const cmd = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: STATE_KEY,
      Body: JSON.stringify(state),
      ContentType: 'application/json',
    });
    await r2Client.send(cmd);
    return true;
  } catch (err: any) {
    console.error('Error saving state to R2:', err);
    return false;
  }
}

export async function GET() {
  try {
    // 1. Fetch from R2 master state
    let cloudState = await getR2State() || {
      creators: [],
      accounts: [],
      posts: [],
      postTargets: [],
      creatorSchedules: {},
      media: []
    };

    // 2. Also query Supabase tables to merge any records created directly
    try {
      const [creatorsRes, accountsRes] = await Promise.all([
        supabase.from('creators').select('*'),
        supabase.from('social_accounts').select('*')
      ]);

      if (creatorsRes.data && Array.isArray(creatorsRes.data)) {
        const existingIds = new Set(cloudState.creators.map((c: any) => c.id));
        creatorsRes.data.forEach((c: any) => {
          if (!existingIds.has(c.id)) {
            cloudState.creators.push(c);
            existingIds.add(c.id);
          }
        });
      }

      if (accountsRes.data && Array.isArray(accountsRes.data)) {
        const existingAccIds = new Set(cloudState.accounts.map((a: any) => a.id));
        accountsRes.data.forEach((a: any) => {
          if (!existingAccIds.has(a.id)) {
            cloudState.accounts.push(a);
            existingAccIds.add(a.id);
          }
        });
      }
    } catch (e) {
      console.warn('Supabase merge fallback warning:', e);
    }

    return NextResponse.json({
      success: true,
      state: cloudState
    });
  } catch (error: any) {
    console.error('GET /api/db/sync error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentState = await getR2State() || {
      creators: [],
      accounts: [],
      posts: [],
      postTargets: [],
      creatorSchedules: {},
      media: []
    };

    // Merge state accurately
    const updatedState = {
      creators: Array.isArray(body.creators) ? body.creators : currentState.creators,
      accounts: Array.isArray(body.accounts) ? body.accounts : currentState.accounts,
      posts: Array.isArray(body.posts) ? body.posts : currentState.posts,
      postTargets: Array.isArray(body.postTargets) ? body.postTargets : currentState.postTargets,
      creatorSchedules: body.creatorSchedules || currentState.creatorSchedules,
      media: Array.isArray(body.media) ? body.media : currentState.media,
      updated_at: new Date().toISOString()
    };

    const saved = await saveR2State(updatedState);

    // Also sync creators to Supabase tables in background if possible
    if (Array.isArray(updatedState.creators)) {
      updatedState.creators.forEach(async (c: any) => {
        try {
          await supabase.from('creators').upsert([c]);
        } catch (e) {}
      });
    }

    return NextResponse.json({ success: saved, state: updatedState });
  } catch (error: any) {
    console.error('POST /api/db/sync error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
