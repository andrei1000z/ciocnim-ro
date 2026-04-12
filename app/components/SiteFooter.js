"use client";

import { usePathname } from "next/navigation";
import LocaleLink from "./LocaleLink";
import { useT } from "../i18n/useT";

export default function SiteFooter() {
  const t = useT();
  const pathname = usePathname();

  // Ascunde pe homepage (/, /ro, /en, /bg, /el) și pe pagina de joc
  const isHome = /^\/(ro|en|bg|el)?$/.test(pathname);
  const isGame = pathname.includes('/joc/');
  if (isHome || isGame) return null;

  return (
    <footer className="w-full border-t border-edge mt-8">
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col items-center gap-3 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted font-medium">
          <LocaleLink href="/terms" className="hover:text-red-400 transition-colors">
            {t('nav.terms')}
          </LocaleLink>
          <LocaleLink href="/privacy" className="hover:text-red-400 transition-colors">
            {t('nav.privacy')}
          </LocaleLink>
          <a href="mailto:ciocnim@mail.com" className="hover:text-red-400 transition-colors">
            contact: ciocnim@mail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
