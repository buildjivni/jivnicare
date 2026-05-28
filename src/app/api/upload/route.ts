import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { getJwtSecret, isBlobConfigured } from '@/lib/infrastructure/env';
import { logger } from '@/lib/infrastructure/logger';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  // Validate Authentication (Temporarily bypassed for Doctor Onboarding flow pilot)
  // In a strict production environment, we should either use presigned URLs or create the user first.
  const token = (await cookies()).get("auth-token")?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const secret = new TextEncoder().encode(getJwtSecret());
      await jose.jwtVerify(token, secret);
      isAuthenticated = true;
    } catch {
      // Invalid session
    }
  }

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isBlobConfigured()) {
    return NextResponse.json(
      { error: 'Upload storage is not configured (BLOB_READ_WRITE_TOKEN).' },
      { status: 503 }
    );
  }

  // ---- Upload Validation ----
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const mime = request.headers.get('content-type')?.split(';')[0]?.trim();
  if (!mime || !allowedMimes.includes(mime)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
  }

  // Simple filename sanity checks
  const parts = filename.split('.');
  if (parts.length !== 2) {
    return NextResponse.json({ error: 'Invalid filename format' }, { status: 400 });
  }
  const [name, ext] = parts;
  const extLower = ext.toLowerCase();
  if (['svg', 'gif', 'exe', 'bat'].includes(extLower)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
  }
  const mimeMap: Record<string, string> = {
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
  };
  if (mimeMap[extLower] !== mime) {
    return NextResponse.json({ error: 'Filename extension does not match MIME type' }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body as any, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error) {
    logger.error({
      category: 'API_EXCEPTION',
      message: 'Upload failed',
      metadata: { filename },
      error,
    });
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
