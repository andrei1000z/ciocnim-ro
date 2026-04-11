"use client";
import Link from "next/link";
import { useLocaleConfig } from "./DictionaryProvider";
import { localizeSlug } from "@/app/i18n/config";

/**
 * Link component care:
 * 1. Adaugă automat prefixul locale (ex: /traditii → /ro/traditii)
 * 2. Traduce slug-ul în limba curentă (ex: /ro/traditii pe BG → /bg/tradicii)
 *
 * Rute ca /joc/[id] sau /profil care NU sunt indexate nu trebuie localizate
 * la nivel de slug (profil e profil, joc e igra/paichnidi — e OK).
 */
export default function LocaleLink({ href, ...props }) {
  const { locale } = useLocaleConfig();

  let localizedHref = href;
  if (typeof href === 'string' && href.startsWith('/')) {
    // Split path în segmente și localizează primul segment (dacă e un slug cunoscut)
    const segments = href.split('/').filter(Boolean); // ["traditii"] sau ["joc", "ABCD"]
    if (segments.length > 0) {
      segments[0] = localizeSlug(segments[0], locale);
    }
    localizedHref = `/${locale}/${segments.join('/')}`;
    // Edge case: href === "/" → /{locale}
    if (href === '/') localizedHref = `/${locale}`;
  }

  return <Link href={localizedHref} {...props} />;
}
