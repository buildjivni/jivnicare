export declare class KeywordMapperService {
    readonly SYMPTOM_MAP: Record<string, string[]>;
    extractSpecialties(query: string): string[];
    expandQuery(query: string): string[];
}
