"use client";

import { useT } from "../i18n/useT";
import LocaleLink from "../components/LocaleLink";

export default function NotFound() {
  const t = useT();

  return (
    <main className="min-h-screen bg-main text-body flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-sm">
        <div className="text-8xl" role="img" aria-label="404">🥚</div>
        <h1 className="text-6xl md:text-8xl font-black text-heading">{t('notFound.heading')}</h1>
        <p className="text-xl md:text-2xl font-bold text-red-400">{t('notFound.subtitle')}</p>
        <p className="text-muted font-medium text-sm md:text-base">
          {t('notFound.body')}
        </p>
        <LocaleLink
          href="/"
          className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg"
        >
          {t('notFound.homeButton')}
        </LocaleLink>
      </div>
    </main>
  );
}
