import { Outfit } from "next/font/google";
import Script from "next/script";
import ClientWrapper from "../components/ClientWrapper";
import ScrollToTop from "../components/ScrollToTop";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import SoundToggle from "../components/SoundToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";
import DictionaryProvider from "../components/DictionaryProvider";
import { getDictionary } from "../i18n/getDictionary";
import { locales, localeConfig } from "../i18n/config";
import { getBaseUrl, isIntlDomain, DOMAINS } from "../lib/constants";

const outfit = Outfit({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-outfit"
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const config = localeConfig[locale] || localeConfig.ro;
  const baseUrl = await getBaseUrl();
  const isIntl = await isIntlDomain();
  const ogImage = isIntl ? '/og-image-trosc.jpg' : '/og-image.jpg';

  return {
    title: {
      default: dict.meta.title,
      template: dict.meta.titleTemplate,
    },
    description: dict.meta.description,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    applicationName: dict.meta.applicationName,
    authors: [{ name: dict.meta.applicationName }],
    creator: dict.meta.applicationName,
    publisher: dict.meta.applicationName,
    formatDetection: { email: false, address: false, telephone: false },
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      url: locale === 'ro' ? baseUrl : `${baseUrl}/${locale}`,
      siteName: dict.meta.applicationName,
      images: [{ url: ogImage, width: 1200, height: 630, alt: dict.meta.title, type: "image/jpeg" }],
      locale: config.ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.twitterTitle,
      description: dict.meta.twitterDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: locale === 'ro' ? baseUrl : `${baseUrl}/${locale}`,
      languages: {
        // RO trăiește pe ciocnim.ro (mono-locale, fără prefix). EN/BG/EL pe trosc.fun.
        'ro': DOMAINS.ro,
        'en': `${DOMAINS.intl}/en`,
        'bg': `${DOMAINS.intl}/bg`,
        'el': `${DOMAINS.intl}/el`,
        'x-default': `${DOMAINS.intl}/en`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "dark light",
};

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const validLocale = locales.includes(locale) ? locale : 'ro';
  const dictionary = await getDictionary(validLocale);
  const config = localeConfig[validLocale] || localeConfig.ro;
  const baseUrl = await getBaseUrl();
  const isIntl = await isIntlDomain();
  const ogImageUrl = isIntl ? `${baseUrl}/og-image-trosc.jpg` : `${baseUrl}/og-image.jpg`;
  const verificationCode = isIntl
    ? null // TODO: adaugă codul pentru trosc.fun din GSC după înregistrare
    : 'gKW3IdyucvuHkv_DkXS0gyehLrH7M7IPUfR9OGYijHU';

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": dictionary.meta.applicationName,
    "url": validLocale === 'ro' ? baseUrl : `${baseUrl}/${validLocale}`,
    "description": dictionary.meta.schemaDescription,
    "applicationCategory": "GameApplication",
    "applicationSubCategory": "BrowserGame",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript",
    "author": { "@type": "Organization", "name": dictionary.meta.applicationName },
    "publisher": { "@type": "Organization", "name": dictionary.meta.applicationName },
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": config.currency },
    "inLanguage": validLocale,
    "image": ogImageUrl,
    "screenshot": ogImageUrl,
  };

  return (
    <html lang={validLocale} suppressHydrationWarning className={`${outfit.variable} selection:bg-red-900/50 selection:text-amber-200 scroll-smooth`}>
      <head>
        {verificationCode && <meta name="google-site-verification" content={verificationCode} />}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('c_theme');if(t==='dark'){;}else if(t==='light')document.documentElement.classList.add('light');else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches){;}else document.documentElement.classList.add('light')}catch(e){document.documentElement.classList.add('light')};if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){});}` }} />
        <Script
          id="schema-main"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      </head>

      <body className={`
        ${outfit.className}
        bg-main
        text-body
        min-h-screen
        min-h-[100dvh]
        w-full
        max-w-[100vw]
        overflow-x-hidden
        antialiased
        scrollbar-hide
      `}>
        <a href="#main-content" className="skip-to-content">{dictionary.skipToContent}</a>

        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none opacity-60" aria-hidden="true">
          <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(220,38,38,0.04),transparent_70%)]"></div>
          <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(245,158,11,0.025),transparent_70%)]"></div>
        </div>

        <DictionaryProvider dictionary={dictionary} localeConfig={config} locale={validLocale}>
          <ClientWrapper>
            <ScrollToTop />
            <ThemeToggle />
            <SoundToggle />
            <LanguageSwitcher />
            <div className="relative z-10 w-full max-w-[100vw] min-h-[100dvh] flex flex-col">
              <main id="main-content" className="flex-1 w-full max-w-[100vw] px-mobile-fix relative">
                {children}
              </main>
              <Footer />
            </div>
          </ClientWrapper>
        </DictionaryProvider>
      </body>
    </html>
  );
}
