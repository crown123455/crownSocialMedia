import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, saveSettings } from '@/lib/settings';

export async function GET() {
  try {
    const settings = await getAllSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
    }

    const result = await saveSettings(body);
    return NextResponse.json({
      success: result.localSuccess || result.supabaseSuccess,
      ...result
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
