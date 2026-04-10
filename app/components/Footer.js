"use client";
import { useT } from "@/app/i18n/useT";
import LocaleLink from "./LocaleLink";

export default function Footer() {
  const t = useT();
  return (
    <footer className="w-full py-6 px-6 mt-auto">
      <nav className="flex items-center justify-center gap-3 mb-2">
        <LocaleLink href="/terms" className="text-xs text-red-400/60 hover:text-red-400 transition-colors">{t('footer.terms')}</LocaleLink>
        <span className="text-xs text-red-400/30">|</span>
        <LocaleLink href="/privacy" className="text-xs text-red-400/60 hover:text-red-400 transition-colors">{t('footer.privacy')}</LocaleLink>
      </nav>
      <p className="text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} Ciocnim.ro
      </p>
    </footer>
  );
}
