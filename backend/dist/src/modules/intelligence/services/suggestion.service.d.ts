import { PrismaService } from '../../../database/prisma.service';
import { KeywordMapperService } from '../../search/services/keyword-mapper.service';
export interface Suggestion {
    type: 'specialty' | 'keyword' | 'symptom' | 'trending' | 'emergency';
    text: string;
    slug?: string;
    icon?: string;
    hint?: string;
}
export declare class SuggestionService {
    private readonly prisma;
    private readonly keywordMapper;
    constructor(prisma: PrismaService, keywordMapper: KeywordMapperService);
    getSuggestions(q?: string, district?: string): Promise<Suggestion[]>;
    getRelatedSearches(query: string): string[];
}
