"use client";

import LocaleLink from "../../components/LocaleLink";
import { useT } from "../../i18n/useT";

export default function TermsPage() {
  const t = useT();
  const sections = t('content.terms.sections');

  return (
    <main className="min-h-screen bg-main text-body">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <LocaleLink href="/" className="text-red-400 hover:text-red-300 transition-colors text-sm font-bold">
            {t('content.terms.backHome')}
          </LocaleLink>
        </div>

        <h1 className="text-3xl font-black text-heading">{t('content.terms.pageTitle')}</h1>
        <p className="text-xs text-muted">
          {t('content.terms.lastUpdated')}: {t('content.terms.lastUpdatedDate')}
        </p>

        <section className="space-y-4 text-sm text-body leading-relaxed">
          {Array.isArray(sections) && sections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-lg font-bold text-heading mt-6">{section.title}</h2>
              <div
                className="space-y-2 [&>p]:mb-2 [&>ul]:mb-2"
                dangerouslySetInnerHTML={{ __html: section.body }}
              />
            </div>
          ))}
        </section>

        <div className="pt-8 border-t border-red-900/20">
          <LocaleLink href="/" className="text-sm text-dim hover:text-red-400 transition-colors font-bold">
            {t('content.terms.backToGame')}
          </LocaleLink>
        </div>
      </div>
    </main>
  );
}
