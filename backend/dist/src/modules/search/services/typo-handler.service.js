"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypoHandlerService = void 0;
const common_1 = require("@nestjs/common");
let TypoHandlerService = class TypoHandlerService {
    TYPO_MAP = {
        cardiolgist: 'cardiologist', cardiologst: 'cardiologist', cardologist: 'cardiologist',
        dermatoligist: 'dermatologist', dermatlogist: 'dermatologist', dermatolgist: 'dermatologist',
        pedatrician: 'pediatrician', peditrician: 'pediatrician', paeditrician: 'pediatrician',
        orthopedist: 'orthopedist', orthopaedist: 'orthopedist', orthopadist: 'orthopedist',
        neuroloist: 'neurologist', nuerologist: 'neurologist', neruologist: 'neurologist',
        ginecologist: 'gynecologist', gynacologist: 'gynecologist', gynaecologist: 'gynecologist',
        opthalmologist: 'ophthalmologist', opthamologist: 'ophthalmologist',
        hospitel: 'hospital', hospitl: 'hospital', hospita: 'hospital',
        emergncy: 'emergency', emergancy: 'emergency', emergeny: 'emergency',
        diabities: 'diabetes', diabetis: 'diabetes', diabates: 'diabetes',
        presure: 'pressure', pressur: 'pressure',
        doctir: 'doctor', doctar: 'doctor',
    };
    correctQuery(query) {
        if (!query)
            return '';
        return query
            .toLowerCase()
            .split(/\s+/)
            .map(word => this.TYPO_MAP[word] || word)
            .join(' ');
    }
};
exports.TypoHandlerService = TypoHandlerService;
exports.TypoHandlerService = TypoHandlerService = __decorate([
    (0, common_1.Injectable)()
], TypoHandlerService);
//# sourceMappingURL=typo-handler.service.js.map