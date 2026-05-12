import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { KeywordMapperService } from '../../search/services/keyword-mapper.service';

export interface Suggestion {
  type: 'specialty' | 'keyword' | 'symptom' | 'trending' | 'emergency';
  text: string;
  slug?: string;
  icon?: string;
  hint?: string; // e.g. "12 doctors in Patna"
}

// Static popular searches for instant display (no DB needed)
const POPULAR_SUGGESTIONS: Suggestion[] = [
  { type: 'trending', text: 'Cardiologist in Patna', icon: '❤️' },
  { type: 'trending', text: 'Child Specialist', icon: '👶' },
  { type: 'trending', text: 'Fever Doctor', icon: '🌡️' },
  { type: 'trending', text: 'Skin Doctor', icon: '🩺' },
  { type: 'trending', text: 'Orthopedist', icon: '🦴' },
  { type: 'trending', text: 'Eye Specialist', icon: '👁️' },
];

const EMERGENCY_SUGGESTION: Suggestion = {
  type: 'emergency',
  text: '🚨 Emergency — Find nearest hospital',
  hint: '24x7 emergency care',
};

@Injectable()
export class SuggestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly keywordMapper: KeywordMapperService,
  ) {}

  // ── Autocomplete suggestions (called on every keystroke) ─────
  async getSuggestions(q?: string, district?: string): Promise<Suggestion[]> {
    if (!q || q.trim().length < 2) {
      return POPULAR_SUGGESTIONS;
    }

    const lower = q.toLowerCase().trim();
    const suggestions: Suggestion[] = [];

    // 1. Emergency shortcut
    const EMERGENCY_TRIGGERS = ['emerg', 'accid', 'icu', 'ambulan', 'urgent'];
    if (EMERGENCY_TRIGGERS.some(t => lower.startsWith(t))) {
      suggestions.push(EMERGENCY_SUGGESTION);
    }

    // 2. Symptom map matches (instant, no DB)
    const symptomMap = this.keywordMapper.SYMPTOM_MAP;
    const symptomMatches = Object.keys(symptomMap)
      .filter(sym => sym.includes(lower) || lower.includes(sym.substring(0, 4)))
      .slice(0, 3)
      .map(sym => ({
        type: 'symptom' as const,
        text: sym.charAt(0).toUpperCase() + sym.slice(1),
        hint: symptomMap[sym]?.[0],
      }));
    suggestions.push(...symptomMatches);

    // 3. DB: matching specialties
    const specialties = await this.prisma.specialty.findMany({
      where: { name: { contains: lower, mode: 'insensitive' } },
      take: 4,
      select: { name: true, slug: true },
    });
    specialties.forEach(s =>
      suggestions.push({ type: 'specialty', text: s.name, slug: s.slug })
    );

    // 4. DB: matching keywords
    const keywords = await this.prisma.keyword.findMany({
      where: { term: { contains: lower, mode: 'insensitive' } },
      take: 4,
      select: { term: true },
    });
    keywords.forEach(k =>
      suggestions.push({ type: 'keyword', text: k.term })
    );

    // 5. If district given, enrich with count hint
    if (district && suggestions.length > 0) {
      const topSpec = specialties[0];
      if (topSpec) {
        const count = await this.prisma.doctor.count({
          where: {
            verificationStatus: 'VERIFIED',
            district: { equals: district, mode: 'insensitive' },
            specialties: { some: { slug: topSpec.slug } },
          },
        });
        if (count > 0) {
          suggestions[0] = {
            ...suggestions[0],
            hint: `${count} doctor${count > 1 ? 's' : ''} in ${district}`,
          };
        }
      }
    }

    // Deduplicate by text
    const seen = new Set<string>();
    return suggestions.filter(s => {
      if (seen.has(s.text.toLowerCase())) return false;
      seen.add(s.text.toLowerCase());
      return true;
    }).slice(0, 8);
  }

  // ── Related search suggestions ──────────────────────────────
  getRelatedSearches(query: string): string[] {
    const lower = query.toLowerCase();

    const related: string[] = [];

    const symptomMap = this.keywordMapper.SYMPTOM_MAP;
    for (const [symptom, specialties] of Object.entries(symptomMap)) {
      if (lower.includes(symptom) || symptom.includes(lower.substring(0, 5))) {
        related.push(...specialties.slice(0, 2).map(
          (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
        ));
        if (related.length >= 5) break;
      }
    }

    // Fallback popular
    if (related.length === 0) {
      return ['Cardiologist', 'General Physician', 'Pediatrician', 'Orthopedist', 'Dermatologist'];
    }

    return [...new Set(related)].slice(0, 5);
  }
}
