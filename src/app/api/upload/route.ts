import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  // Validate Authentication (Temporarily bypassed for Doctor Onboarding flow pilot)
  // In a strict production environment, we should either use presigned URLs or create the user first.
  const token = (await cookies()).get('auth_token')?.value;
  let isAuthenticated = false;
  
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development');
      await jose.jwtVerify(token, secret);
      isAuthenticated = true;
    } catch (error) {
      // Not authenticated via token
    }
  }

  // If not authenticated, we still allow it but could add rate limiting here in the future
  console.log(`Upload requested for ${filename}, isAuthenticated: ${isAuthenticated}`);

  try {
    const blob = await put(filename, request.body as any, {
      access: 'public', // Required to be public so it can be viewed by admins and patients (if photo)
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}
