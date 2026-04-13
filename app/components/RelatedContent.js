"use client";

import LocaleLink from "./LocaleLink";
import { useT } from "../i18n/useT";

const ALL_LINKS = [
  { slug: "traditii", icon: "📖", titleKey: "discover.traditions", descKey: "related.traditionsDesc" },
  { slug: "retete", icon: "🍳", titleKey: "discover.recipes", descKey: "related.recipesDesc" },
  { slug: "urari", icon: "🕊️", titleKey: "discover.greetings", descKey: "related.greetingsDesc" },
  { slug: "vopsit-natural", icon: "🧅", titleKey: "discover.dyeing", descKey: "related.dyeingDesc" },
  { slug: "calendar", icon: "📅", titleKey: "discover.calendar", descKey: "related.calendarDesc" },
  { slug: "ghid", icon: "🎮", titleKey: "discover.guide", descKey: "related.guideDesc" },
];

/**
 * Block "Vezi și" — cross-linking între paginile de conținut.
 * Afișează 3 carduri random (exclude pagina curentă).
 * Scop SEO: internal linking + încurajează explorarea content-ului.
 *
 * Usage: <RelatedContent currentSlug="retete" />
 */
export default function RelatedContent({ currentSlug }) {
  const t = useT();
  const filtered = ALL_LINKS.filter((l) => l.slug !== currentSlug);
  // Deterministic shuffle — same page always shows same 3 (SSR-friendly)
  const shuffled = [...filtered].sort((a, b) => a.slug.localeCompare(b.slug));
  const picked = shuffled.slice(0, 3);

  return (
    <section className="my-8">
      <h2 className="text-sm font-black uppercase tracking-wider text-dim mb-4 text-center">
        ✨ {t('related.title') || 'Vezi și'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {picked.map((link) => (
          <LocaleLink
            key={link.slug}
            href={`/${link.slug}`}
            onClick={() => { try { import("./Analytics").then(m => m.trackEvent("related-click", { from: currentSlug, to: link.slug })); } catch {} }}
            className="group relative overflow-hidden rounded-2xl border border-edge bg-card hover:bg-elevated hover:border-red-700/30 p-4 transition-all active:scale-[0.98]"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">{link.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-heading leading-tight">{t(link.titleKey)}</p>
                <p className="text-[11px] text-muted mt-0.5 leading-snug">{t(link.descKey) || ''}</p>
              </div>
            </div>
            <span className="absolute right-3 bottom-3 text-red-400/40 group-hover:text-red-400 transition-colors text-lg">→</span>
          </LocaleLink>
        ))}
      </div>
    </section>
  );
}
