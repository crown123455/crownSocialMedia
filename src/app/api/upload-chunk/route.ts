import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '@/lib/r2';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

// Vercel has a ~4.5MB body limit for serverless functions.
// We handle this by accepting chunks and assembling them.

// Store chunks temporarily in memory (per upload session)
const uploadSessions = new Map<string, { chunks: Buffer[], filename: string, contentType: string }>();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const chunk = formData.get('chunk') as File | null;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string || '0');
    const totalChunks = parseInt(formData.get('totalChunks') as string || '1');
    const sessionId = formData.get('sessionId') as string;
    const filename = formData.get('filename') as string || 'upload';
    const contentType = formData.get('contentType') as string || 'application/octet-stream';

    if (!chunk) {
      return NextResponse.json({ error: 'No chunk provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await chunk.arrayBuffer());

    // Single chunk (small file) - upload directly
    if (totalChunks === 1) {
      const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${uuidv4()}_${safeName}`;
      const r2Key = `uploads/${uniqueFileName}`;

      try {
        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: r2Key,
          Body: buffer,
          ContentType: contentType,
        });
        await r2Client.send(command);
        const publicUrl = `${process.env.NEXT_PUBLIC_R2_DEV_URL}/${r2Key}`;
        return NextResponse.json({ publicUrl, r2Key, done: true });
      } catch (r2Error: any) {
        console.error('R2 upload error:', r2Error.message);
        return NextResponse.json({ error: 'فشل رفع الملف للسيرفر السحابي: ' + r2Error.message }, { status: 500 });
      }
    }

    // Multi-chunk upload
    if (!uploadSessions.has(sessionId)) {
      uploadSessions.set(sessionId, { chunks: new Array(totalChunks), filename, contentType });
    }

    const session = uploadSessions.get(sessionId)!;
    session.chunks[chunkIndex] = buffer;

    // Check if all chunks received
    const receivedCount = session.chunks.filter(Boolean).length;
    
    if (receivedCount < totalChunks) {
      return NextResponse.json({ 
        done: false, 
        received: receivedCount, 
        total: totalChunks,
        progress: Math.round((receivedCount / totalChunks) * 100)
      });
    }

    // All chunks received - assemble and upload
    const fullBuffer = Buffer.concat(session.chunks);
    uploadSessions.delete(sessionId); // Clean up

    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${uuidv4()}_${safeName}`;
    const r2Key = `uploads/${uniqueFileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: r2Key,
        Body: fullBuffer,
        ContentType: session.contentType,
      });
      await r2Client.send(command);
      const publicUrl = `${process.env.NEXT_PUBLIC_R2_DEV_URL}/${r2Key}`;
      return NextResponse.json({ publicUrl, r2Key, done: true });
    } catch (r2Error: any) {
      console.error('R2 upload error:', r2Error.message);
      return NextResponse.json({ error: 'فشل رفع الملف للسيرفر السحابي: ' + r2Error.message }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Chunk upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
