import Script from "next/script";
import { BASE_URL } from '../../lib/constants';
import { locales } from '../../i18n/config';

const path = '/ghid';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: "Ghid de Joc – Cum Joci Ciocnit Ouă Online",
    description: "Ghid complet pentru ciocnit ouă online pe Ciocnim.ro. Cum joci, cum câștigi, cum creezi grupuri și cum deblochezi achievement-uri.",
    keywords: [
      "cum se joaca ciocnit oua online", "ghid ciocnim", "reguli joc oua paste",
      "cum castigi ciocnit oua", "joc oua paste online", "ciocnit oua reguli"
    ],
    openGraph: {
      title: "Ghid de Joc – Ciocnim.ro",
      description: "Învață să joci ciocnit ouă online: reguli, trucuri și ghid pas cu pas.",
      url: `${BASE_URL}/${locale}${path}`,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "Ghid Ciocnit Ouă Online | Ciocnim.ro",
      description: "Reguli, trucuri și ghid pas cu pas pentru jocul de ciocnit ouă online.",
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

export default async function GhidLayout({ children, params }) {
  const { locale } = await params;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Acasă", "item": `${BASE_URL}/${locale}` },
      { "@type": "ListItem", "position": 2, "name": "Ghid de Joc", "item": `${BASE_URL}/${locale}${path}` }
    ]
  };

  return (
    <>
      <Script id="breadcrumb-ghid" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
