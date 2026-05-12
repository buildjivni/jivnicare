export declare enum DayOfWeek {
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
    SUNDAY = "SUNDAY"
}
export declare class TimeSlotDto {
    start: string;
    end: string;
}
export declare class UpdateAvailabilityDto {
    availableDays?: DayOfWeek[];
    availableTimeSlots?: TimeSlotDto[];
    maxAppointmentsPerDay?: number;
}
