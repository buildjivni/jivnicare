import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { getJwtSecret, isCloudinaryConfigured } from '@/lib/infrastructure/env';
import { logger } from '@/lib/infrastructure/logger';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { cloudinary } from '@/lib/cloudinary';

function transformCloudinaryUrl(url: string, filename: string): string {
  if (filename.toLowerCase().endsWith('.pdf')) {
    return url;
  }
  const uploadToken = '/upload/';
  const index = url.indexOf(uploadToken);
  if (index === -1) return url;
  
  let transform = 'f_auto,q_auto';
  if (filename.startsWith('doctor-profile')) {
    transform = 'w_400,h_400,c_fill,f_auto,q_auto';
  } else if (filename.startsWith('clinic-photo')) {
    transform = 'w_800,c_limit,f_auto,q_auto';
  }
  
  return url.substring(0, index + uploadToken.length) + transform + '/' + url.substring(index + uploadToken.length);
}

const uploadFromBuffer = (buffer: Buffer, options: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    uploadStream.end(buffer);
  });
};

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

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: 'Upload storage is not configured (Cloudinary keys are missing).' },
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
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isPdf = extLower === 'pdf';
    const publicId = name.replace(/[^a-zA-Z0-9-_]/g, '_') + '_' + Date.now();
    
    const options = {
      folder: 'jivnicare',
      public_id: publicId,
      resource_type: isPdf ? 'raw' : 'image',
    };

    const uploadResult = await uploadFromBuffer(buffer, options);
    const originalUrl = uploadResult.secure_url;
    const transformedUrl = transformCloudinaryUrl(originalUrl, filename);

    return NextResponse.json({
      url: transformedUrl,
      original_url: originalUrl,
      public_id: uploadResult.public_id,
    });
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

