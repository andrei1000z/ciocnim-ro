import Script from "next/script";
import { BASE_URL } from '../../lib/constants';
import { locales } from '../../i18n/config';

const year = new Date().getFullYear();
const path = '/calendar';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: `Când Pică Paștele în ${year}, ${year + 1}, ${year + 2}? – Calendar Ortodox și Catolic`,
    description: `Calendarul complet al Paștelui Ortodox și Catolic până în ${year + 4}. Află de ce data se schimbă în fiecare an, cum se calculează și când pică în același weekend. Planifică Paștele ${year} din timp!`,
    keywords: [
      `cand pica pastele ${year}`, `data pastele ortodox ${year}`, `pastele catolic ${year}`,
      "calendar paste ortodox", "calculator data paste", `paste ${year + 1} data`,
      `paste ${year + 2} aceeasi zi`, `cand e paste ${year} romania`,
      `saptamana mare ${year}`, "paste ortodox si catolic"
    ],
    openGraph: {
      title: `Calendar Paște ${year}–${year + 4} – Ortodox și Catolic`,
      description: `Verifică exact când pică Paștele în fiecare an și descoperă de ce data se schimbă. Calendar ortodox și catolic complet.`,
      url: `${BASE_URL}/${locale}${path}`,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Calendar Paște – Ciocnim.ro" }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `Când Pică Paștele? Calendar Ortodox și Catolic ${year}–${year + 4} | Ciocnim.ro`,
      description: `Data exactă a Paștelui Ortodox și Catolic pentru ${year}, ${year + 1}, ${year + 2}, ${year + 3} și ${year + 4}.`,
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

export default async function CalendarLayout({ children, params }) {
  const { locale } = await params;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Acasă", "item": `${BASE_URL}/${locale}` },
      { "@type": "ListItem", "position": 2, "name": "Calendar Paște", "item": `${BASE_URL}/${locale}${path}` }
    ]
  };

  return (
    <>
      <Script id="breadcrumb-calendar" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
