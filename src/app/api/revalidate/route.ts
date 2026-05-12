import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Called by the JivniCare backend whenever a doctor or hospital
 * is verified by an admin — purges the cached ISR page instantly.
 *
 * POST /api/revalidate
 * Body: { secret: string, path: string }
 */
export async function POST(req: NextRequest) {
  const { secret, path } = await req.json();

  // Validate the shared secret to prevent unauthorized cache busting
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid revalidation secret' }, { status: 401 });
  }

  if (!path || typeof path !== 'string') {
    return NextResponse.json({ message: 'Invalid path' }, { status: 400 });
  }

  revalidatePath(path);

  return NextResponse.json({
    revalidated: true,
    path,
    timestamp: new Date().toISOString(),
  });
}
