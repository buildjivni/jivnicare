import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { RankingService } from './services/ranking.service';
import { AnalyticsService } from './services/analytics.service';
import { TypoHandlerService } from './services/typo-handler.service';
import { KeywordMapperService } from './services/keyword-mapper.service';
import { EmergencyRankingService } from './services/emergency-ranking.service';

@Module({
  controllers: [SearchController],
  providers: [
    RankingService,
    AnalyticsService,
    TypoHandlerService,
    KeywordMapperService,
    EmergencyRankingService,
  ],
  exports: [
    RankingService,
    AnalyticsService,
    KeywordMapperService,
  ],
})
export class SearchModule {}
