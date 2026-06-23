import { apiResponse, apiError } from '@/lib/utils/api-response';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { getJwtSecret, isBlobConfigured } from '@/lib/infrastructure/env';
import { logger } from '@/lib/infrastructure/logger';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return apiError('Filename is required', 400);
  }

  // Validate Authentication (Allows either custom signed token or a valid NextAuth session)
  const token = (await cookies()).get("jivnicare_token")?.value;
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
    const nextAuthSession = await getServerSession(authOptions);
    if (nextAuthSession?.user) {
      isAuthenticated = true;
    }
  }

  if (!isAuthenticated) {
    return apiError("Unauthorized", 401);
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
    return apiError('Unsupported file type', 415);
  }

  // Simple filename sanity checks
  const parts = filename.split('.');
  if (parts.length !== 2) {
    return apiError('Invalid filename format', 400);
  }
  const [name, ext] = parts;
  const extLower = ext.toLowerCase();
  if (['svg', 'gif', 'exe', 'bat'].includes(extLower)) {
    return apiError('File type not allowed', 400);
  }
  const mimeMap: Record<string, string> = {
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
  };
  if (mimeMap[extLower] !== mime) {
    return apiError('Filename extension does not match MIME type', 400);
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
    return apiError('Upload failed', 500);
  }
}
