import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Database-agnostic test connection (prevents leaking database brand)
    await prisma.user.count();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[HealthCheck] Diagnostics failed:", error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
