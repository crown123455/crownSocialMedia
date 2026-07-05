import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from '@/lib/r2';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }

    // Generate unique key
    const extension = filename.split('.').pop();
    const uniqueKey = `${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: uniqueKey,
      ContentType: contentType,
    });

    // Presigned URL expires in 15 minutes
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
    
    // The public URL that this file will have after upload
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_DEV_URL}/${uniqueKey}`;

    return NextResponse.json({
      uploadUrl: signedUrl,
      publicUrl,
      r2Key: uniqueKey,
    });
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
