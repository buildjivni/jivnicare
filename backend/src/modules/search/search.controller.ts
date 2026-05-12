import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { RankingService } from './services/ranking.service';
import { AnalyticsService } from './services/analytics.service';
import { SearchQueryDto } from './dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(
    private readonly rankingService: RankingService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(@Query() query: SearchQueryDto) {
    const result = await this.rankingService.searchAndRank(query);
    
    // Asynchronously log the search for analytics
    const totalResults = result.doctors.length + result.hospitals.length;
    this.analyticsService.trackSearch(
      query.q || '', 
      result.normalizedQuery, 
      query.district, 
      totalResults
    );

    return result;
  }

  @Get('trending')
  async getTrending() {
    return this.analyticsService.getTrendingSearches();
  }
}
