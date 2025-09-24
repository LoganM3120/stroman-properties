import { Buffer } from 'node:buffer';
import { getSupabaseBaseUrl, getServiceRoleKey } from '@/lib/supabase/rest';

interface UploadOptions {
  bucket: string;
  objectPath: string;
  body: ArrayBuffer | Uint8Array | Buffer;
  contentType?: string;
  upsert?: boolean;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
}

function toBinaryBody(body: UploadOptions['body']): Uint8Array | Buffer {
  if (body instanceof ArrayBuffer) {
    return Buffer.from(body);
  }
  return body;
}

function buildStorageUrl(bucket: string, encodedPath: string): string {
  const baseUrl = getSupabaseBaseUrl().replace(/\/+$/, '');
  const cleanBucket = bucket.replace(/^\/+/, '');
  return `${baseUrl}/storage/v1/object/${cleanBucket}/${encodedPath}`;
}

function encodePath(path: string): string {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildPublicUrl(bucket: string, path: string): string {
  const baseUrl = getSupabaseBaseUrl().replace(/\/+$/, '');
  const cleanBucket = bucket.replace(/^\/+/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${baseUrl}/storage/v1/object/public/${cleanBucket}/${cleanPath}`;
}

export async function uploadStorageObject(options: UploadOptions): Promise<UploadResult> {
  const { bucket, objectPath, body, contentType, upsert } = options;
  const data = toBinaryBody(body);
  const encodedPath = encodePath(objectPath.replace(/^\/+/, ''));
  const url = buildStorageUrl(bucket, encodedPath);
  const serviceKey = getServiceRoleKey();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': contentType ?? 'application/octet-stream',
      'x-upsert': upsert ? 'true' : 'false',
    },
    body: data,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Failed to upload storage object (${response.status}): ${text}`);
  }

  return {
    path: objectPath.replace(/^\/+/, ''),
    publicUrl: buildPublicUrl(bucket, objectPath),
  };
}
