import {
  Controller,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

import { RecommendationService } from './services/recommendation.service';
import { SuggestionService } from './services/suggestion.service';
import { RelevanceService } from './services/relevance.service';
import { SmartSearchDto, SuggestionDto, RecommendationDto } from './dto/intelligence.dto';

@Controller('intelligence')
@Public()
export class IntelligenceController {
  constructor(

    private readonly recommendations: RecommendationService,
    private readonly suggestions: SuggestionService,
    private readonly relevance: RelevanceService,
  ) {}


  // ────────────────────────────────────────────────────────────
  // SUGGESTIONS & AUTOCOMPLETE
  // ────────────────────────────────────────────────────────────

  /**
   * GET /intelligence/suggestions?q=fever&district=Patna
   * Real-time autocomplete (< 2 chars returns popular)
   */
  @Get('suggestions')
  async getSuggestions(@Query() dto: SuggestionDto) {
    return this.suggestions.getSuggestions(dto.q, dto.district);
  }

  /**
   * GET /intelligence/related?q=cardiologist
   * "People also search for" related terms
   */
  @Get('related')
  async getRelated(@Query('q') q: string) {
    return {
      query: q,
      related: this.suggestions.getRelatedSearches(q ?? ''),
    };
  }

  // ────────────────────────────────────────────────────────────
  // RECOMMENDATIONS
  // ────────────────────────────────────────────────────────────

  /**
   * GET /intelligence/recommendations/top-doctors
   */
  @Get('recommendations/top-doctors')
  async getTopDoctors(@Query() dto: RecommendationDto) {
    return this.recommendations.getTopDoctors({
      district: dto.district,
      specialty: dto.specialty,
      limit: dto.limit ? Number(dto.limit) : 6,
    });
  }

  /**
   * GET /intelligence/recommendations/emergency?district=Patna
   */
  @Get('recommendations/emergency')
  async getEmergencyProviders(
    @Query('district') district?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.recommendations.getEmergencyProviders(district, limit);
  }

  /**
   * GET /intelligence/recommendations/related/:doctorId
   */
  @Get('recommendations/related/:doctorId')
  async getRelatedDoctors(
    @Param('doctorId', ParseUUIDPipe) doctorId: string,
    @Query('limit', new DefaultValuePipe(4), ParseIntPipe) limit?: number,
  ) {
    return this.recommendations.getRelatedDoctors(doctorId, limit);
  }

  /**
   * GET /intelligence/recommendations/district/:district
   */
  @Get('recommendations/district/:district')
  async getDistrictOverview(@Param('district') district: string) {
    return this.recommendations.getDistrictHealthcareOverview(district);
  }

  // ────────────────────────────────────────────────────────────
  // TRENDING & RELEVANCE
  // ────────────────────────────────────────────────────────────

  /**
   * GET /intelligence/trending?district=Patna
   */
  @Get('trending')
  async getTrending(
    @Query('district') district?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    const [searches, specialties] = await Promise.all([
      this.relevance.getTrendingSearches(district, limit),
      this.relevance.getTrendingSpecialties(8),
    ]);
    return { searches, specialties };
  }

  /**
   * GET /intelligence/trending/district — Bihar district-wise trends
   */
  @Get('trending/district')
  async getDistrictTrending() {
    return this.relevance.getDistrictTrending(5);
  }

  /**
   * GET /intelligence/no-results?q=xyz — Zero result helper
   */
  @Get('no-results')
  async getNoResultHelp(@Query('q') q?: string) {
    return this.relevance.getZeroResultHelp(q ?? 'your search');
  }
}
