import { describe, it, expect } from 'vitest';
import { esteNumeInterzis, normalizeForFilter, valideazaNume } from '../app/lib/profanityFilter';

describe('normalizeForFilter', () => {
  it('converts to lowercase', () => {
    expect(normalizeForFilter('ABC')).toBe('abc');
  });

  it('replaces leet-speak characters', () => {
    expect(normalizeForFilter('@dm1n')).toBe('admin');
    expect(normalizeForFilter('70p')).toBe('top');
    expect(normalizeForFilter('9ame')).toBe('game');
  });

  it('removes separators', () => {
    expect(normalizeForFilter('a_b-c.d e')).toBe('abcde');
  });
});

describe('esteNumeInterzis', () => {
  it('blocks explicit profanity', () => {
    expect(esteNumeInterzis('MUIE')).toBe(true);
    expect(esteNumeInterzis('pizda')).toBe(true);
    expect(esteNumeInterzis('CACAT')).toBe(true);
  });

  it('blocks leet-speak profanity', () => {
    expect(esteNumeInterzis('MU1E')).toBe(true);
    expect(esteNumeInterzis('c@c@t')).toBe(true);
  });

  it('blocks profanity with separators', () => {
    expect(esteNumeInterzis('M_U_I_E')).toBe(true);
    expect(esteNumeInterzis('p-u-l-a')).toBe(true);
  });

  it('allows clean names', () => {
    expect(esteNumeInterzis('ANDREI')).toBe(false);
    expect(esteNumeInterzis('MARIA')).toBe(false);
    expect(esteNumeInterzis('CAMPION2024')).toBe(false);
    expect(esteNumeInterzis('OuDeAur')).toBe(false);
  });

  it('blocks v->u substitution evasion', () => {
    expect(esteNumeInterzis('pvla')).toBe(true);
  });
});

describe('valideazaNume', () => {
  it('rejects empty names', () => {
    expect(valideazaNume('')).toEqual({ valid: false, error: 'Numele este obligatoriu.' });
    expect(valideazaNume(null)).toEqual({ valid: false, error: 'Numele este obligatoriu.' });
    expect(valideazaNume(undefined)).toEqual({ valid: false, error: 'Numele este obligatoriu.' });
  });

  it('rejects names shorter than 2 characters', () => {
    expect(valideazaNume('A')).toEqual({ valid: false, error: 'Minim 2 caractere.' });
  });

  it('accepts names with 2 characters', () => {
    expect(valideazaNume('AB')).toEqual({ valid: true });
  });

  it('rejects names longer than 20 characters', () => {
    expect(valideazaNume('A'.repeat(21))).toEqual({ valid: false, error: 'Maxim 20 de caractere.' });
  });

  it('accepts names with exactly 20 characters', () => {
    expect(valideazaNume('A'.repeat(20))).toEqual({ valid: true });
  });

  it('rejects names with dangerous characters', () => {
    expect(valideazaNume('test<script>')).toEqual({ valid: false, error: 'Doar litere, cifre, spații și cratime.' });
    expect(valideazaNume('name"DROP')).toEqual({ valid: false, error: 'Doar litere, cifre, spații și cratime.' });
    expect(valideazaNume('user;--')).toEqual({ valid: false, error: 'Doar litere, cifre, spații și cratime.' });
    expect(valideazaNume('a&b')).toEqual({ valid: false, error: 'Doar litere, cifre, spații și cratime.' });
  });

  it('accepts names with diacritics', () => {
    expect(valideazaNume('Ștefan')).toEqual({ valid: true });
    expect(valideazaNume('Ioana-Maria')).toEqual({ valid: true });
    expect(valideazaNume('Băluță')).toEqual({ valid: true });
  });

  it('accepts names with spaces, hyphens, underscores', () => {
    expect(valideazaNume('Ion Pop')).toEqual({ valid: true });
    expect(valideazaNume('Ana-Maria')).toEqual({ valid: true });
    expect(valideazaNume('Cool_Name')).toEqual({ valid: true });
  });

  it('rejects profanity', () => {
    const result = valideazaNume('MUIE');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Alege alt nume');
  });

  it('accepts normal Romanian names', () => {
    expect(valideazaNume('ANDREI')).toEqual({ valid: true });
    expect(valideazaNume('Maria Ionescu')).toEqual({ valid: true });
    expect(valideazaNume('OuRosu2024')).toEqual({ valid: true });
  });
});
