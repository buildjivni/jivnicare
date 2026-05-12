import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SearchModule } from '../search/search.module';
import { IntelligenceController } from './intelligence.controller';

import { RecommendationService } from './services/recommendation.service';
import { SuggestionService } from './services/suggestion.service';
import { RelevanceService } from './services/relevance.service';

@Module({
  imports: [DatabaseModule, SearchModule],
  controllers: [IntelligenceController],
  providers: [
    RecommendationService,
    SuggestionService,
    RelevanceService,
  ],
  exports: [
    RecommendationService,
    RelevanceService,
  ],
})
export class IntelligenceModule {}
