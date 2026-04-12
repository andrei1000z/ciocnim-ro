"use client";

import { usePathname } from "next/navigation";
import LocaleLink from "./LocaleLink";
import { useT } from "../i18n/useT";

export default function SiteFooter() {
  const t = useT();
  const pathname = usePathname();

  const isHome = /^\/(ro|en|bg|el)?$/.test(pathname);
  const isGame = pathname.includes('/joc/');
  if (isHome || isGame) return null;

  return (
    <footer className="w-full border-t border-edge mt-8">
      <div className="max-w-3xl mx-auto px-4 py-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted font-medium">
        <LocaleLink href="/terms" className="hover:text-red-400 transition-colors">
          {t('footer.terms')}
        </LocaleLink>
        <span className="text-edge">|</span>
        <LocaleLink href="/privacy" className="hover:text-red-400 transition-colors">
          {t('footer.privacy')}
        </LocaleLink>
        <span className="text-edge">|</span>
        <a href="mailto:ciocnim@mail.com" className="hover:text-red-400 transition-colors">
          Contact: ciocnim@mail.com
        </a>
      </div>
    </footer>
  );
}
