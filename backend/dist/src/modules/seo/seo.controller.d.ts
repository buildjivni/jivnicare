import { SeoService } from './seo.service';
export declare class SeoController {
    private readonly seoService;
    constructor(seoService: SeoService);
    getSitemapData(): Promise<{
        doctors: {
            updatedAt: Date;
            slug: string;
        }[];
        hospitals: {
            updatedAt: Date;
            slug: string;
        }[];
    }>;
    getActiveDistricts(): Promise<string[]>;
}
