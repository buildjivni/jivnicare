import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth'; // adjust path as needed
import { operationalCounters } from '@/lib/infrastructure/logger';

export async function GET(req: Request) {
  // Simple admin JWT check – assume getSession returns { role }
  const session = await getSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(operationalCounters);
}
