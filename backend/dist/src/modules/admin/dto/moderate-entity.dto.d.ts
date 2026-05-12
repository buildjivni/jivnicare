export declare enum ModerationAction {
    APPROVE = "APPROVE",
    REJECT = "REJECT",
    SUSPEND = "SUSPEND"
}
export declare class ModerateEntityDto {
    action: ModerationAction;
    reason?: string;
}
