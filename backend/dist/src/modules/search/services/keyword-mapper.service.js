"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordMapperService = void 0;
const common_1 = require("@nestjs/common");
let KeywordMapperService = class KeywordMapperService {
    SYMPTOM_MAP = {
        bukhar: ['general physician', 'fever', 'general medicine'],
        fever: ['general physician', 'general medicine', 'bukhar'],
        'viral fever': ['general physician', 'general medicine'],
        malaria: ['general physician', 'infectious disease'],
        baccha: ['pediatrician', 'child specialist'],
        bache: ['pediatrician', 'child specialist'],
        child: ['pediatrician', 'child specialist'],
        haddi: ['orthopedist', 'orthopedics', 'bone doctor'],
        bone: ['orthopedist', 'orthopedics', 'bone doctor'],
        'joint pain': ['orthopedist', 'rheumatologist'],
        'back pain': ['orthopedist', 'neurologist'],
        kamar: ['orthopedist'],
        pet: ['gastroenterologist', 'stomach', 'general physician'],
        stomach: ['gastroenterologist', 'general physician'],
        acidity: ['gastroenterologist', 'general physician'],
        heart: ['cardiologist', 'heart specialist'],
        dil: ['cardiologist'],
        'chest pain': ['cardiologist', 'general physician'],
        skin: ['dermatologist', 'skin specialist'],
        allergy: ['dermatologist', 'allergist'],
        khujli: ['dermatologist'],
        hair: ['dermatologist', 'trichologist'],
        pregnancy: ['gynecologist', 'obstetrician'],
        women: ['gynecologist'],
        aurat: ['gynecologist'],
        mahila: ['gynecologist'],
        brain: ['neurologist', 'neurosurgeon'],
        headache: ['neurologist', 'general physician'],
        sar: ['neurologist', 'general physician'],
        tooth: ['dentist', 'dental'],
        teeth: ['dentist', 'dental'],
        daant: ['dentist'],
    };
    extractSpecialties(query) {
        const specialties = new Set();
        for (const [symptom, mappedSpecs] of Object.entries(this.SYMPTOM_MAP)) {
            if (query.includes(symptom)) {
                mappedSpecs.forEach(spec => specialties.add(spec));
            }
        }
        return Array.from(specialties);
    }
    expandQuery(query) {
        const terms = query.split(/\s+/);
        const expanded = new Set(terms);
        terms.forEach(term => {
            if (this.SYMPTOM_MAP[term]) {
                this.SYMPTOM_MAP[term].forEach(t => expanded.add(t));
            }
        });
        return Array.from(expanded);
    }
};
exports.KeywordMapperService = KeywordMapperService;
exports.KeywordMapperService = KeywordMapperService = __decorate([
    (0, common_1.Injectable)()
], KeywordMapperService);
//# sourceMappingURL=keyword-mapper.service.js.map