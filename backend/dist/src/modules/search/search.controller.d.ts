import { RankingService } from './services/ranking.service';
import { AnalyticsService } from './services/analytics.service';
import { SearchQueryDto } from './dto/search.dto';
export declare class SearchController {
    private readonly rankingService;
    private readonly analyticsService;
    constructor(rankingService: RankingService, analyticsService: AnalyticsService);
    search(query: SearchQueryDto): Promise<{
        normalizedQuery: string;
        doctors: any[];
        hospitals: any[];
    }>;
    getTrending(): Promise<{
        query: any;
        count: any;
    }[]>;
}
