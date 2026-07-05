// Test presigned URL generation
const { S3Client } = require('@aws-sdk/client-s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: 'https://98a627dc8ed7f4c7a7271d35beae62d6.r2.cloudflarestorage.com',
  forcePathStyle: true,
  credentials: {
    accessKeyId: 'cf3035fb6458b5e9c529e66c52c7bf2c',
    secretAccessKey: 'e2367be865d8a3ab992bf98d1d3e2193e1ca3bd9f745abf52addc5c5fccbf0ad',
  },
});

async function test() {
  const command = new PutObjectCommand({
    Bucket: 'crown',
    Key: 'test-upload.mp4',
    ContentType: 'video/mp4',
  });

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
  console.log('=== PRESIGNED URL ===');
  console.log(signedUrl);
  console.log('');
  
  // Parse the URL to check its structure
  const url = new URL(signedUrl);
  console.log('Host:', url.host);
  console.log('Path:', url.pathname);
  console.log('');
  
  // Try an actual OPTIONS preflight request
  try {
    const res = await fetch(signedUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://crown-social-media.vercel.app',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'content-type',
      }
    });
    console.log('OPTIONS Status:', res.status);
    console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
    console.log('Access-Control-Allow-Methods:', res.headers.get('access-control-allow-methods'));
  } catch (e) {
    console.log('OPTIONS request FAILED:', e.message);
  }

  // Try an actual small PUT upload
  try {
    const testData = Buffer.from('test file content');
    const res = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4' },
      body: testData,
    });
    console.log('\nPUT Upload Status:', res.status);
    console.log('PUT Response:', await res.text());
  } catch (e) {
    console.log('PUT request FAILED:', e.message);
  }
}

test();
