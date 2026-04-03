"use client";

import LocaleLink from "./LocaleLink";
import { useT } from "@/app/i18n/useT";
import { useLocaleConfig } from "./DictionaryProvider";

export default function PageHeader() {
  const t = useT();
  const { gameName } = useLocaleConfig();

  return (
    <div className="w-full flex justify-between items-center p-6 md:p-8 bg-surface shadow-lg shadow-black/20 border-b border-edge-strong transition-colors duration-300">
      <LocaleLink href="/" className="flex items-center gap-2 group">
        <span className="text-3xl group-hover:scale-110 transition-all">🥚</span>
        <span className="font-bold text-xl md:text-2xl text-heading">{t('hero.title')}<span className="text-accent-red-strong">{t('hero.titleDot')}{t('hero.titleSuffix')}</span></span>
      </LocaleLink>
      <LocaleLink href="/" className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95">
        {t('result.home')}
      </LocaleLink>
    </div>
  );
}
