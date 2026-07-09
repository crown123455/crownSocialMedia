import { S3Client } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://98a627dc8ed7f4c7a7271d35beae62d6.r2.cloudflarestorage.com',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'cf3035fb6458b5e9c529e66c52c7bf2c',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'e2367be865d8a3ab992bf98d1d3e2193e1ca3bd9f745abf52addc5c5fccbf0ad',
  },
});
