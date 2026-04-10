import Script from "next/script";
import { BASE_URL } from '../../lib/constants';
import { locales } from '../../i18n/config';

const year = new Date().getFullYear();
const path = '/vopsit-natural';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: `Cum Vopsești Ouă Natural ${year} – Rețete cu Foi de Ceapă, Curcumă și Varză`,
    description: `Ghid complet pas cu pas pentru vopsit ouă natural acasă în ${year}, fără chimicale. Ouă roșii cu foi de ceapă, galben cu curcumă, albastru cu varză roșie. Rețetele tradiționale ale bunicii.`,
    keywords: [
      "vopsit oua natural", "oua rosii foi de ceapa", "cum vopsesti oua acasa",
      "vopsit oua curcuma", "vopsit oua varza rosie", "oua naturale paste",
      `retete vopsit oua ${year}`, "oua fara chimicale", "traditie vopsit oua romanesc",
      `culori naturale oua paste ${year}`
    ],
    openGraph: {
      title: `Cum Vopsești Ouă Natural – Ghid Complet Paște ${year}`,
      description: `Secretul bunicilor: ouă roșii cu foi de ceapă, galben cu curcumă, albastru cu varză roșie. Fără chimicale, 100% natural!`,
      url: `${BASE_URL}/${locale}${path}`,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Vopsit Natural Ouă – Ciocnim.ro" }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `Vopsit Ouă Natural ${year} – Rețete Tradiționale fără Chimicale | Ciocnim.ro`,
      description: `Ouă roșii cu foi de ceapă, galben cu curcumă, albastru cu varză. Ghid complet pentru Paștele ${year}.`,
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}${path}`,
      languages: Object.fromEntries(
        locales.map(l => [l, `${BASE_URL}/${l}${path}`])
      ),
    },
  };
}

export default async function VopsitNaturalLayout({ children, params }) {
  const { locale } = await params;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Acasă", "item": `${BASE_URL}/${locale}` },
      { "@type": "ListItem", "position": 2, "name": "Vopsit Natural Ouă", "item": `${BASE_URL}/${locale}${path}` }
    ]
  };

  return (
    <>
      <Script id="breadcrumb-vopsit" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
