import { RecommendationService } from './services/recommendation.service';
import { SuggestionService } from './services/suggestion.service';
import { RelevanceService } from './services/relevance.service';
import { SuggestionDto, RecommendationDto } from './dto/intelligence.dto';
export declare class IntelligenceController {
    private readonly recommendations;
    private readonly suggestions;
    private readonly relevance;
    constructor(recommendations: RecommendationService, suggestions: SuggestionService, relevance: RelevanceService);
    getSuggestions(dto: SuggestionDto): Promise<import("./services/suggestion.service").Suggestion[]>;
    getRelated(q: string): Promise<{
        query: string;
        related: string[];
    }>;
    getTopDoctors(dto: RecommendationDto): Promise<{
        doctors: {
            id: string;
            name: string;
            experience: number;
            fee: number;
            district: string;
            emergencyAvailable: boolean;
            specialties: {
                name: string;
                slug: string;
            }[];
            verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
            slug: string;
            profileImage: string | null;
            rating: number;
        }[];
        count: number;
    }>;
    getEmergencyProviders(district?: string, limit?: number): Promise<{
        hospitals: {
            phone: string;
            id: string;
            name: string;
            district: string;
            slug: string;
            rating: number;
            address: string;
            ambulanceAvailable: boolean;
        }[];
        doctors: {
            id: string;
            name: string;
            district: string;
            specialties: {
                name: string;
            }[];
            slug: string;
            rating: number;
        }[];
    }>;
    getRelatedDoctors(doctorId: string, limit?: number): Promise<{
        doctors: {
            id: string;
            name: string;
            fee: number;
            district: string;
            specialties: {
                name: string;
            }[];
            slug: string;
            profileImage: string | null;
            rating: number;
        }[];
    }>;
    getDistrictOverview(district: string): Promise<{
        district: string;
        totalDoctors: number;
        totalHospitals: number;
        emergencyHospitals: number;
        topSpecialties: {
            name: string;
            slug: string;
        }[];
    }>;
    getTrending(district?: string, limit?: number): Promise<{
        searches: {
            query: string;
            count: number;
        }[];
        specialties: {
            name: string;
            slug: string;
            viewCount: number;
        }[];
    }>;
    getDistrictTrending(): Promise<Record<string, {
        query: string;
        count: number;
    }[]>>;
    getNoResultHelp(q?: string): Promise<{
        message: string;
        suggestions: string[];
        emergencyNote: string;
    }>;
}
