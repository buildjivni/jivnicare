import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session'; // correct path
import { operationalCounters } from '@/lib/infrastructure/logger';

export async function GET(req: Request) {
  // Simple admin JWT check – assume getSession returns { role }
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return apiError('Unauthorized', 401);
  }
  return NextResponse.json(operationalCounters);
}
