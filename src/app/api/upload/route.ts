import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Separate client for presigned URLs - no checksum (browser can't send it)
const r2PresignClient = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }

    // Generate unique key
    const extension = filename.split('.').pop();
    const uniqueKey = `uploads/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: uniqueKey,
      ContentType: contentType,
    });

    // Presigned URL expires in 15 minutes
    const signedUrl = await getSignedUrl(r2PresignClient, command, { 
      expiresIn: 900,
      unhoistableHeaders: new Set(['x-amz-checksum-crc32']),
      signableHeaders: new Set(['host', 'content-type']),
    });
    
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

