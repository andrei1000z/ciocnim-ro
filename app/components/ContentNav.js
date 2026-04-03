"use client";

import LocaleLink from "./LocaleLink";
import { useT } from "@/app/i18n/useT";

export default function ContentNav({ current }) {
  const t = useT();

  const navLinks = [
    { href: "/traditii", label: t('discover.traditions') },
    { href: "/retete", label: t('discover.recipes') },
    { href: "/urari", label: t('discover.greetings') },
    { href: "/vopsit-natural", label: t('discover.dyeing') },
    { href: "/calendar", label: t('discover.calendar') },
    { href: "/ghid", label: t('discover.guide') },
    { href: "/clasament", label: t('discover.leaderboard') },
  ];

  return (
    <nav aria-label="Content pages" className="w-full overflow-x-auto scrollbar-hide border-b border-red-900/10 bg-card">
      <div className="flex items-center gap-1 px-4 py-2 max-w-4xl mx-auto">
        {navLinks.map(link => (
          <LocaleLink
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              current === link.href
                ? "bg-red-700 text-white"
                : "text-dim hover:text-heading hover:bg-elevated"
            }`}
          >
            {link.label}
          </LocaleLink>
        ))}
      </div>
    </nav>
  );
}
