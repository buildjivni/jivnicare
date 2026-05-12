import { PrismaService } from '../../../database/prisma.service';
export declare class RelevanceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTrendingSearches(district?: string, limit?: number): Promise<{
        query: string;
        count: number;
    }[]>;
    getDistrictTrending(limit?: number): Promise<Record<string, {
        query: string;
        count: number;
    }[]>>;
    getTrendingSpecialties(limit?: number): Promise<{
        name: string;
        slug: string;
        viewCount: number;
    }[]>;
    didYouMean(correctedQuery: string, originalQuery: string): string | undefined;
    getZeroResultHelp(query: string): Promise<{
        message: string;
        suggestions: string[];
        emergencyNote: string;
    }>;
}
