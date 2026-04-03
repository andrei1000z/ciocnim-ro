"use client";
import { useDictionary } from "@/app/components/DictionaryProvider";

export function useT() {
  const dict = useDictionary();

  return function t(key, params = {}) {
    const value = key.split('.').reduce((obj, k) => obj?.[k], dict);
    if (value === undefined) {
      console.warn(`[i18n] Missing key: ${key}`);
      return key;
    }
    if (typeof value !== 'string') return value;
    return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
  };
}
