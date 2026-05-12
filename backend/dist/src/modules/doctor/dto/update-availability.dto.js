"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAvailabilityDto = exports.TimeSlotDto = exports.DayOfWeek = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["MONDAY"] = "MONDAY";
    DayOfWeek["TUESDAY"] = "TUESDAY";
    DayOfWeek["WEDNESDAY"] = "WEDNESDAY";
    DayOfWeek["THURSDAY"] = "THURSDAY";
    DayOfWeek["FRIDAY"] = "FRIDAY";
    DayOfWeek["SATURDAY"] = "SATURDAY";
    DayOfWeek["SUNDAY"] = "SUNDAY";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
class TimeSlotDto {
    start;
    end;
}
exports.TimeSlotDto = TimeSlotDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'start must be in HH:mm format' }),
    __metadata("design:type", String)
], TimeSlotDto.prototype, "start", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'end must be in HH:mm format' }),
    __metadata("design:type", String)
], TimeSlotDto.prototype, "end", void 0);
class UpdateAvailabilityDto {
    availableDays;
    availableTimeSlots;
    maxAppointmentsPerDay;
}
exports.UpdateAvailabilityDto = UpdateAvailabilityDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(DayOfWeek, { each: true }),
    __metadata("design:type", Array)
], UpdateAvailabilityDto.prototype, "availableDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TimeSlotDto),
    __metadata("design:type", Array)
], UpdateAvailabilityDto.prototype, "availableTimeSlots", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateAvailabilityDto.prototype, "maxAppointmentsPerDay", void 0);
//# sourceMappingURL=update-availability.dto.js.map