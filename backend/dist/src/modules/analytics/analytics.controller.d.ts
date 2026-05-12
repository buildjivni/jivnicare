import { SearchAnalyticsService } from './services/search-analytics.service';
import { DoctorAnalyticsService } from './services/doctor-analytics.service';
import { HospitalAnalyticsService } from './services/hospital-analytics.service';
import { PlatformAnalyticsService } from './services/platform-analytics.service';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
export declare class AnalyticsController {
    private readonly searchAnalyticsService;
    private readonly doctorAnalyticsService;
    private readonly hospitalAnalyticsService;
    private readonly platformAnalyticsService;
    constructor(searchAnalyticsService: SearchAnalyticsService, doctorAnalyticsService: DoctorAnalyticsService, hospitalAnalyticsService: HospitalAnalyticsService, platformAnalyticsService: PlatformAnalyticsService);
    getTopSearches(filter: AnalyticsFilterDto): Promise<{
        query: any;
        count: any;
    }[]>;
    getFailedSearches(filter: AnalyticsFilterDto): Promise<{
        query: any;
        failures: any;
    }[]>;
    getPopularDoctors(filter: AnalyticsFilterDto): Promise<{
        doctor: {
            id: string;
            name: string;
            district: string;
            specialties: {
                name: string;
            }[];
        } | undefined;
        views: any;
    }[]>;
    getPopularHospitals(filter: AnalyticsFilterDto): Promise<{
        hospital: {
            id: string;
            name: string;
            district: string;
            emergencyAvailable: boolean;
        } | undefined;
        views: any;
    }[]>;
    getPlatformOverview(): Promise<{
        searches: {
            total: number;
            today: number;
        };
        profileViews: {
            total: number;
            today: number;
        };
        failedSearches: {
            today: number;
        };
    }>;
}
