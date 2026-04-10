import Script from "next/script";
import { BASE_URL } from '../../lib/constants';
import { locales } from '../../i18n/config';

const path = '/retete';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: "Rețete Tradiționale de Paște – Cozonac, Drob, Pască, Miel",
    description: "Cele mai bune rețete tradiționale de Paște: cozonac pufos, drob de miel, pască cu brânză, friptură de miel. Pas cu pas, cu ingrediente scalabile și timp de preparare.",
    keywords: [
      "retete paste romanesti", "cozonac traditional reteta", "drob de miel reteta",
      "pasca cu branza reteta", "friptura de miel paste", "retete traditionale paste",
      "cozonac pufos reteta pas cu pas", "cum fac cozonac", "reteta drob traditional",
      "meniu de paste romanesc"
    ],
    openGraph: {
      title: "Rețete Tradiționale de Paște – Cozonac, Drob, Pască, Miel",
      description: "Rețetele clasice ale mesei de Paște: cozonac, drob, pască și friptură de miel. Ghid complet pas cu pas.",
      url: `${BASE_URL}/${locale}${path}`,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Rețete de Paște – Ciocnim.ro" }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "Rețete de Paște – Cozonac, Drob, Pască | Ciocnim.ro",
      description: "Rețete tradiționale românești de Paște: cozonac pufos, drob, pască, miel. Pas cu pas!",
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

export default async function ReteteLayout({ children, params }) {
  const { locale } = await params;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Acasă", "item": `${BASE_URL}/${locale}` },
      { "@type": "ListItem", "position": 2, "name": "Rețete de Paște", "item": `${BASE_URL}/${locale}${path}` }
    ]
  };

  const recipeListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Rețete Tradiționale de Paște",
    "description": "Colecție de rețete tradiționale românești pentru masa de Paște",
    "url": `${BASE_URL}/${locale}${path}`,
    "numberOfItems": 4,
    "itemListElement": [
      {
        "@type": "ListItem", "position": 1,
        "item": {
          "@type": "Recipe",
          "name": "Cozonac Tradițional",
          "description": "Cozonacul pufos, cu miez elastic și coajă aurie, este regele mesei de Paște.",
          "prepTime": "PT40M", "cookTime": "PT50M", "totalTime": "PT4H",
          "recipeYield": "2 cozonaci",
          "recipeCategory": "Cozonac", "recipeCuisine": "Română",
          "keywords": "cozonac, paste, traditional, romanesc",
          "image": `${BASE_URL}/og-image.jpg`,
          "url": `${BASE_URL}/${locale}${path}`,
          "author": { "@type": "Organization", "name": "Ciocnim.ro" },
          "inLanguage": locale
        }
      },
      {
        "@type": "ListItem", "position": 2,
        "item": {
          "@type": "Recipe",
          "name": "Drob de Miel",
          "description": "Drobul de miel, aromat cu verdeață proaspătă, este nelipsit de pe masa de Paște.",
          "prepTime": "PT30M", "cookTime": "PT1H", "totalTime": "PT1H30M",
          "recipeYield": "6-8 porții",
          "recipeCategory": "Aperitiv", "recipeCuisine": "Română",
          "keywords": "drob, miel, paste, traditional",
          "image": `${BASE_URL}/og-image.jpg`,
          "url": `${BASE_URL}/${locale}${path}`,
          "author": { "@type": "Organization", "name": "Ciocnim.ro" },
          "inLanguage": locale
        }
      },
      {
        "@type": "ListItem", "position": 3,
        "item": {
          "@type": "Recipe",
          "name": "Pască cu Brânză",
          "description": "Pasca dulce cu brânză de vaci și stafide, sfințită la biserică în Sâmbăta Mare.",
          "prepTime": "PT45M", "cookTime": "PT40M", "totalTime": "PT3H",
          "recipeYield": "1 pască mare",
          "recipeCategory": "Pască", "recipeCuisine": "Română",
          "keywords": "pasca, branza, paste, traditional romanesc",
          "image": `${BASE_URL}/og-image.jpg`,
          "url": `${BASE_URL}/${locale}${path}`,
          "author": { "@type": "Organization", "name": "Ciocnim.ro" },
          "inLanguage": locale
        }
      },
      {
        "@type": "ListItem", "position": 4,
        "item": {
          "@type": "Recipe",
          "name": "Friptură de Miel",
          "description": "Friptura de miel la cuptor cu rozmarin, usturoi și vin alb — piesa de rezistență a mesei pascale.",
          "prepTime": "PT20M", "cookTime": "PT2H", "totalTime": "PT2H20M",
          "recipeYield": "6-8 porții",
          "recipeCategory": "Fel principal", "recipeCuisine": "Română",
          "keywords": "friptura miel, paste, cuptor, traditional",
          "image": `${BASE_URL}/og-image.jpg`,
          "url": `${BASE_URL}/${locale}${path}`,
          "author": { "@type": "Organization", "name": "Ciocnim.ro" },
          "inLanguage": locale
        }
      }
    ]
  };

  return (
    <>
      <Script id="breadcrumb-retete" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Script id="schema-retete" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeListSchema) }} />
      {children}
    </>
  );
}
