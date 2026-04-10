import Script from "next/script";
import { BASE_URL } from '../../lib/constants';
import { locales } from '../../i18n/config';

const year = new Date().getFullYear();
const path = '/clasament';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: `Clasament Național Ciocnit Ouă ${year} – Top Jucători și Regiuni`,
    description: `Clasamentul complet al celor mai buni jucători și regiuni la ciocnit ouă de Paște ${year}. Vezi cine domină competiția pe ciocnim.ro!`,
    keywords: [
      `clasament ciocnit oua ${year}`, "top jucatori paste", "clasament paste online",
      "cei mai buni jucatori oua", "clasament regional paste romania"
    ],
    openGraph: {
      title: `Clasament Național Ciocnit Ouă ${year} – Ciocnim.ro`,
      description: `Top jucători și regiuni la ciocnit ouă online, Paște ${year}.`,
      url: `${BASE_URL}/${locale}${path}`,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Clasament Ciocnit Ouă ${year} | Ciocnim.ro`,
      description: `Cine are cel mai tare ou în România? Vezi clasamentul național.`,
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

export default async function ClasamentLayout({ children, params }) {
  const { locale } = await params;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Acasă", "item": `${BASE_URL}/${locale}` },
      { "@type": "ListItem", "position": 2, "name": "Clasament Național", "item": `${BASE_URL}/${locale}${path}` }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Clasament Național Ciocnit Ouă ${year}`,
    "description": `Top jucători și regiuni la ciocnit ouă de Paște ${year} pe ciocnim.ro`,
    "url": `${BASE_URL}/${locale}${path}`,
    "numberOfItems": 10,
    "itemListOrder": "https://schema.org/ItemListOrderDescending"
  };

  return (
    <>
      <Script id="breadcrumb-clasament" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Script id="schema-clasament" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      {children}
    </>
  );
}
