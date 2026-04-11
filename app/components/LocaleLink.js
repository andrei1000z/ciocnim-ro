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
    const segments = href.split('/').filter(Boolean);
    if (segments.length > 0) {
      segments[0] = localizeSlug(segments[0], locale);
    }
    // ro = mono-locale pe ciocnim.ro → URL-urile nu au prefix /ro
    // bg/el/en = pe trosc.fun → URL-urile au prefix /{locale}
    if (locale === 'ro') {
      localizedHref = href === '/' ? '/' : `/${segments.join('/')}`;
    } else {
      localizedHref = href === '/' ? `/${locale}` : `/${locale}/${segments.join('/')}`;
    }
  }

  return <Link href={localizedHref} {...props} />;
}
