"use client";

import { usePathname } from "next/navigation";
import LocaleLink from "./LocaleLink";
import { useT } from "../i18n/useT";

export default function SiteFooter() {
  const t = useT();
  const pathname = usePathname();

  const isGame = pathname.includes('/joc/');
  const isIntersezon = pathname.includes('/intersezon');
  if (isGame || isIntersezon) return null;

  const isHome = /^\/(ro|en|bg|el)?$/.test(pathname);

  return (
    <footer className="w-full border-t border-edge mt-8">
      <div className="max-w-3xl mx-auto px-4 py-6 text-center space-y-3">
        {isHome ? (
          <>
            <p className="text-xs text-muted leading-relaxed">
              <strong className="text-body">Ciocnim.ro</strong> este jocul tradițional românesc de ciocnit ouă de Paște, acum online. Joacă gratuit cu prietenii și familia, indiferent de distanță. Hristos a Înviat! 🥚
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted font-medium">
              <LocaleLink href="/despre" className="hover:text-red-400 transition-colors">
                {t('footer.about')}
              </LocaleLink>
              <span className="text-edge">·</span>
              <a href="https://buymeacoffee.com/ciocnim" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors font-bold">
                {t('footer.donate')}
              </a>
              <span className="text-edge">·</span>
              <a href="mailto:ciocnim@mail.com" className="hover:text-red-400 transition-colors">
                Contact: ciocnim@mail.com
              </a>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted font-medium">
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
        )}
        <p className="text-xs text-dim">© 2026 Ciocnim.ro</p>
      </div>
    </footer>
  );
}
