import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const decoded: any = await verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return apiError("Forbidden", 403);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Fetch top 20 search queries (last 7 days, by frequency)
    const topQueriesRaw = await prisma.searchLog.groupBy({
      by: ['query'],
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      _count: {
        query: true
      },
      _avg: {
        resultCount: true
      },
      _max: {
        createdAt: true
      },
      orderBy: {
        _count: {
          query: 'desc'
        }
      },
      take: 20
    });

    // 2. Fetch top 10 zero-result queries (last 7 days, by frequency)
    const zeroResultQueriesRaw = await prisma.searchLog.groupBy({
      by: ['query'],
      where: {
        resultCount: 0,
        createdAt: { gte: sevenDaysAgo }
      },
      _count: {
        query: true
      },
      _max: {
        createdAt: true
      },
      orderBy: {
        _count: {
          query: 'desc'
        }
      },
      take: 10
    });

    const topQueries = topQueriesRaw.map(q => ({
      query: q.query,
      searchCount: q._count.query,
      resultCount: q._avg.resultCount !== null ? Math.round(q._avg.resultCount) : 0,
      lastSearched: q._max.createdAt
    }));

    const zeroResultQueries = zeroResultQueriesRaw.map(q => ({
      query: q.query,
      searchCount: q._count.query,
      resultCount: 0,
      lastSearched: q._max.createdAt
    }));

    return apiResponse({
      success: true,
      topQueries,
      zeroResultQueries
    });

  } catch (error) {
    console.error("Admin Search Insights API Error:", error);
    return apiError("Internal Server Error", 500);
  }
}
