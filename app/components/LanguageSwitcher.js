"use client";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeConfig } from "@/app/i18n/config";
import { useLocaleConfig } from "./DictionaryProvider";

export default function LanguageSwitcher() {
  const { locale } = useLocaleConfig();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value)}
        className="bg-card border border-edge rounded-xl px-3 py-2 text-xs font-bold text-body cursor-pointer"
      >
        {locales.map(l => (
          <option key={l} value={l}>
            {localeConfig[l].flag} {localeConfig[l].name}
          </option>
        ))}
      </select>
    </div>
  );
}
