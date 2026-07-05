import { AwsClient } from 'aws4fetch';

interface Env {
  R2_ENDPOINT: string;
  R2_BUCKET_NAME: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_PUBLIC_URL: string;
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // POST /presign — generate a presigned PUT URL for R2
    if (url.pathname === '/presign' && request.method === 'POST') {
      try {
        const body = await request.json() as { filename?: string; contentType?: string };
        const { filename, contentType } = body;

        if (!filename || !contentType) {
          return Response.json(
            { error: 'Missing filename or contentType' },
            { status: 400, headers: corsHeaders }
          );
        }

        const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `uploads/${crypto.randomUUID()}_${safeName}`;
        const r2ObjectUrl = `${env.R2_ENDPOINT}/${env.R2_BUCKET_NAME}/${key}`;

        const aws = new AwsClient({
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        });

        // Sign a PUT request with query-string signature (presigned URL)
        const signed = await aws.sign(
          new Request(r2ObjectUrl, {
            method: 'PUT',
            headers: { 'Content-Type': contentType },
          }),
          { aws: { signQuery: true } }
        );

        const publicUrl = `${env.R2_PUBLIC_URL}/${key}`;

        return Response.json(
          { uploadUrl: signed.url, publicUrl, r2Key: key },
          { headers: corsHeaders }
        );
      } catch (err: any) {
        return Response.json(
          { error: err.message || 'Failed to generate presigned URL' },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'crown-upload-worker' }, { headers: corsHeaders });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
