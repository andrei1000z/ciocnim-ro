"use client";
import Link from "next/link";
import { useLocaleConfig } from "./DictionaryProvider";

export default function LocaleLink({ href, ...props }) {
  const { locale } = useLocaleConfig();
  const localizedHref = href.startsWith('/') ? `/${locale}${href}` : href;
  return <Link href={localizedHref} {...props} />;
}
