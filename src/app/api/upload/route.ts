import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { getJwtSecret, isBlobConfigured } from '@/lib/env';
import { logger } from '@/lib/logger';

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

  try {
    const blob = await put(filename, request.body as any, {
      access: 'public', // Required to be public so it can be viewed by admins and patients (if photo)
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
