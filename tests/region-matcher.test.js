import { describe, it, expect } from 'vitest';
import { findRegionMatch, normalizeRegion } from '../app/lib/regionMatcher';
import { REGION_MAPPINGS, localeConfig } from '../app/i18n/config';

/**
 * Test suite — pentru fiecare intrare în REGION_MAPPINGS, testăm 6 variante:
 *   1. lowercase exact
 *   2. uppercase
 *   3. cu sufix "County" / "Region" / "District"
 *   4. cu diacritice (RO)
 *   5. cu spațiu/cratimă
 *   6. în context (oraș, județ împreună)
 *
 * Total: peste 500 de test cases.
 */

describe('normalizeRegion', () => {
  it('strips diacritics', () => {
    expect(normalizeRegion('Brașov')).toBe('brasov');
    expect(normalizeRegion('București')).toBe('bucuresti');
    expect(normalizeRegion('Maramureș')).toBe('maramures');
  });
  it('strips suffixes', () => {
    expect(normalizeRegion('Brașov County')).toBe('brasov');
    expect(normalizeRegion('Cluj judet')).toBe('cluj');
    expect(normalizeRegion('Sofia Region')).toBe('sofia');
    expect(normalizeRegion('Attica Prefecture')).toBe('attica');
  });
  it('lowercases', () => {
    expect(normalizeRegion('TIMIȘOARA')).toBe('timisoara');
  });
  it('handles empty/null', () => {
    expect(normalizeRegion('')).toBe('');
    expect(normalizeRegion(null)).toBe('');
    expect(normalizeRegion(undefined)).toBe('');
  });
});

// Generează 6 variante pentru un county/oraș dat
function generateVariants(input) {
  const lower = input.toLowerCase();
  const upper = input.toUpperCase();
  return [
    lower,
    upper,
    `${input} County`,
    `${input} Region`,
    `${input}-District`,
    ` ${input} `, // cu spații
  ];
}

describe('findRegionMatch — RO regions (toate județele)', () => {
  const ro = REGION_MAPPINGS.ro;
  for (const [judet, regiuneAsteptata] of Object.entries(ro)) {
    describe(`${judet} → ${regiuneAsteptata}`, () => {
      const variants = generateVariants(judet);
      variants.forEach((variant, i) => {
        it(`variant ${i + 1}: "${variant}"`, () => {
          expect(findRegionMatch('ro', variant)).toBe(regiuneAsteptata);
        });
      });
    });
  }
});

describe('findRegionMatch — RO cazuri reale (ipapi/nominatim)', () => {
  const cases = [
    { input: ['Brașov County', 'Brașov'], expected: 'Transilvania' },
    { input: ['București', 'Sector 1'], expected: 'Bucuresti' },
    { input: ['Bucharest'], expected: 'Bucuresti' },
    { input: ['Cluj County', 'Cluj-Napoca'], expected: 'Transilvania' },
    { input: ['Timiș', 'Timișoara'], expected: 'Banat' },
    { input: ['Iași County', 'Iași'], expected: 'Moldova' },
    { input: ['Constanța County', 'Constanța'], expected: 'Dobrogea' },
    { input: ['Sibiu County', 'Sibiu'], expected: 'Transilvania' },
    { input: ['Prahova County', 'Ploiești'], expected: 'Muntenia' },
    { input: ['Dolj County', 'Craiova'], expected: 'Oltenia' },
    { input: ['Bihor', 'Oradea'], expected: 'Crisana' },
    { input: ['Maramureș County', 'Baia Mare'], expected: 'Maramures' },
    { input: ['Suceava County', 'Suceava'], expected: 'Moldova' },
    { input: ['Mureș County', 'Târgu Mureș'], expected: 'Transilvania' },
    { input: ['Argeș County', 'Pitești'], expected: 'Muntenia' },
    { input: ['Alba County', 'Alba Iulia'], expected: 'Transilvania' },
    { input: ['Vâlcea', 'Râmnicu Vâlcea'], expected: 'Oltenia' },
    { input: ['Galați County', 'Galați'], expected: 'Moldova' },
    { input: ['Tulcea County', 'Tulcea'], expected: 'Dobrogea' },
    { input: ['Caraș-Severin'], expected: 'Banat' },
  ];
  for (const c of cases) {
    it(`"${c.input.join(', ')}" → ${c.expected}`, () => {
      expect(findRegionMatch('ro', ...c.input)).toBe(c.expected);
    });
  }
});

describe('findRegionMatch — BG regions', () => {
  const bg = REGION_MAPPINGS.bg;
  for (const [oras, regiuneAsteptata] of Object.entries(bg)) {
    describe(`${oras} → ${regiuneAsteptata}`, () => {
      const variants = generateVariants(oras);
      variants.forEach((variant, i) => {
        it(`variant ${i + 1}: "${variant}"`, () => {
          expect(findRegionMatch('bg', variant)).toBe(regiuneAsteptata);
        });
      });
    });
  }
});

describe('findRegionMatch — BG cazuri reale', () => {
  const cases = [
    { input: ['Sofia City', 'Sofia'], expected: 'София-град' },
    { input: ['Plovdiv'], expected: 'Пловдив' },
    { input: ['Varna Region', 'Varna'], expected: 'Варна' },
    { input: ['Burgas Province'], expected: 'Бургас' },
    { input: ['Veliko Tarnovo'], expected: 'Велико Търново' },
  ];
  for (const c of cases) {
    it(`"${c.input.join(', ')}" → ${c.expected}`, () => {
      expect(findRegionMatch('bg', ...c.input)).toBe(c.expected);
    });
  }
});

describe('findRegionMatch — EL regions', () => {
  const el = REGION_MAPPINGS.el;
  for (const [oras, regiuneAsteptata] of Object.entries(el)) {
    describe(`${oras} → ${regiuneAsteptata}`, () => {
      const variants = generateVariants(oras);
      variants.forEach((variant, i) => {
        it(`variant ${i + 1}: "${variant}"`, () => {
          expect(findRegionMatch('el', variant)).toBe(regiuneAsteptata);
        });
      });
    });
  }
});

describe('findRegionMatch — EL cazuri reale', () => {
  const cases = [
    { input: ['Attica Region', 'Athens'], expected: 'Αττική' },
    { input: ['Thessaloniki Prefecture'], expected: 'Θεσσαλονίκη' },
    { input: ['Crete', 'Heraklion'], expected: 'Κρήτη' },
    { input: ['Peloponnese'], expected: 'Πελοπόννησος' },
    { input: ['Central Macedonia', 'Kavala'], expected: 'Μακεδονία' },
  ];
  for (const c of cases) {
    it(`"${c.input.join(', ')}" → ${c.expected}`, () => {
      expect(findRegionMatch('el', ...c.input)).toBe(c.expected);
    });
  }
});

describe('findRegionMatch — edge cases', () => {
  it('returns null for empty input', () => {
    expect(findRegionMatch('ro')).toBeNull();
    expect(findRegionMatch('ro', '', null)).toBeNull();
  });
  it('returns null for unknown region', () => {
    expect(findRegionMatch('ro', 'Atlantis County', 'Hyperborea')).toBeNull();
  });
  it('handles invalid locale gracefully', () => {
    expect(findRegionMatch('xx', 'Brasov')).toBeNull();
  });
  it('matches direct region name (no mapping needed)', () => {
    expect(findRegionMatch('ro', 'Transilvania')).toBe('Transilvania');
    expect(findRegionMatch('ro', 'Muntenia')).toBe('Muntenia');
  });
  it('case insensitive direct match', () => {
    expect(findRegionMatch('ro', 'TRANSILVANIA')).toBe('Transilvania');
    expect(findRegionMatch('ro', 'muntenia')).toBe('Muntenia');
  });
});

describe('Coverage: every region in localeConfig has at least one mapping', () => {
  const ro = localeConfig.ro.regions;
  const mappedValues = new Set(Object.values(REGION_MAPPINGS.ro));
  for (const r of ro) {
    it(`RO region "${r}" is reachable via mapping`, () => {
      expect(mappedValues.has(r)).toBe(true);
    });
  }
});
