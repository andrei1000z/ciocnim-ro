import Script from "next/script";
import { BASE_URL } from '../../lib/constants';
import { locales } from '../../i18n/config';

const year = new Date().getFullYear();
const path = '/urari';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: `Mesaje și Urări de Paște ${year} – Frumoase, Scurte și Gata de Trimis`,
    description: `Cele mai frumoase mesaje de Paște ${year} pentru familie și prieteni. Copiază și trimite pe WhatsApp, Instagram sau Facebook urări tradiționale și moderne. Hristos a Înviat!`,
    keywords: [
      `mesaje de paste ${year}`, "urari de paste", "mesaje hristos a inviat",
      "urari paste whatsapp", "mesaje scurte paste", "felicitari pascale",
      "urari traditionale romanesti", "texte frumoase de paste",
      `mesaje paste familie`, `statusuri paste ${year}`
    ],
    openGraph: {
      title: `Mesaje și Urări de Paște ${year} – Copiază și Trimite Instant`,
      description: `Găsește mesajul perfect de Paște ${year} pentru cei dragi. Scurte, frumoase, din suflet — gata de trimis pe WhatsApp sau Instagram.`,
      url: `${BASE_URL}/${locale}${path}`,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Urări de Paște – Ciocnim.ro" }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `Mesaje de Paște ${year} – Cele Mai Frumoase Urări | Ciocnim.ro`,
      description: `Copiază urările tale de Paște și trimite lumina celor dragi. Hristos a Înviat!`,
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

export default async function UrariLayout({ children, params }) {
  const { locale } = await params;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Acasă", "item": `${BASE_URL}/${locale}` },
      { "@type": "ListItem", "position": 2, "name": "Urări de Paște", "item": `${BASE_URL}/${locale}${path}` }
    ]
  };

  return (
    <>
      <Script id="breadcrumb-urari" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
