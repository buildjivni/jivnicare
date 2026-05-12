export declare class EmergencyRankingService {
    private readonly EMERGENCY_KEYWORDS;
    isEmergencyQuery(query: string): boolean;
    calculateEmergencyBoost(isEmergencyQuery: boolean, entityEmergencyAvailable: boolean): number;
}
