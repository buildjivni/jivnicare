import { PrismaService } from '../../../database/prisma.service';
import { TypoHandlerService } from './typo-handler.service';
import { KeywordMapperService } from './keyword-mapper.service';
import { EmergencyRankingService } from './emergency-ranking.service';
import { SearchQueryDto } from '../dto/search.dto';
export declare class RankingService {
    private readonly prisma;
    private readonly typoHandler;
    private readonly keywordMapper;
    private readonly emergencyRanking;
    constructor(prisma: PrismaService, typoHandler: TypoHandlerService, keywordMapper: KeywordMapperService, emergencyRanking: EmergencyRankingService);
    searchAndRank(dto: SearchQueryDto): Promise<{
        normalizedQuery: string;
        doctors: any[];
        hospitals: any[];
    }>;
    private fetchDoctors;
    private fetchHospitals;
    private calculateDoctorScore;
    private calculateHospitalScore;
}
