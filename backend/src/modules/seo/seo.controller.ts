import { Controller, Get } from '@nestjs/common';
import { SeoService } from './seo.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Public()
  @Get('sitemap-data')
  async getSitemapData() {
    return this.seoService.getSitemapData();
  }

  @Public()
  @Get('districts')
  async getActiveDistricts() {
    return this.seoService.getActiveDistricts();
  }
}
