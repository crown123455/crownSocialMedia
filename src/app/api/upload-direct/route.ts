import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '@/lib/r2';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export const maxDuration = 300; // 5 minutes timeout for large video files
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Safe filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${uuidv4()}_${safeName}`;
    const r2Key = `uploads/${uniqueFileName}`;

    let publicUrl = '';
    let usedFallback = false;

    // 1. Try uploading to Cloudflare R2
    try {
      if (process.env.R2_BUCKET_NAME && process.env.R2_ENDPOINT) {
        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: r2Key,
          Body: buffer,
          ContentType: file.type,
        });
        await r2Client.send(command);
        publicUrl = `${process.env.NEXT_PUBLIC_R2_DEV_URL}/${r2Key}`;
        console.log('Successfully uploaded to R2:', publicUrl);
      } else {
        throw new Error('R2 environment variables missing');
      }
    } catch (r2Error: any) {
      console.warn('R2 upload failed or not configured, falling back to local storage:', r2Error.message);
      usedFallback = true;
    }

    // 2. Fallback / Local Storage (or always save local copy for guaranteed local publishing)
    if (usedFallback || !publicUrl) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.promises.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, uniqueFileName);
        await fs.promises.writeFile(filePath, buffer);
        publicUrl = `/uploads/${uniqueFileName}`;
        console.log('Successfully saved to local disk:', publicUrl);
      } catch (localError: any) {
        console.error('Local disk saving error:', localError);
        throw new Error(`Failed to upload file: ${localError.message}`);
      }
    }

    return NextResponse.json({ publicUrl, r2Key, usedFallback });
  } catch (err: any) {
    console.error('Direct upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
