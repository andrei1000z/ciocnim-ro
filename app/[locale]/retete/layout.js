import Script from "next/script";
import { buildPageMetadata, buildBreadcrumb } from "../../lib/pageMeta";
import { getBaseUrl } from "../../lib/constants";
import { localizeSlug } from "../../i18n/config";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, slugKey: 'retete' });
}

export default async function ReteteLayout({ children, params }) {
  const { locale } = await params;
  const baseUrl = await getBaseUrl();
  const slug = localizeSlug('retete', locale);
  const url = `${baseUrl}/${locale}/${slug}`;

  const breadcrumb = await buildBreadcrumb({ locale, slugKey: 'retete' });

  const recipeListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Rețete Tradiționale de Paște",
    "description": "Colecție de rețete tradiționale pentru masa de Paște",
    "url": url,
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
          "image": `${baseUrl}/og-image.jpg`,
          "url": url,
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
          "image": `${baseUrl}/og-image.jpg`,
          "url": url,
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
          "image": `${baseUrl}/og-image.jpg`,
          "url": url,
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
          "image": `${baseUrl}/og-image.jpg`,
          "url": url,
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
