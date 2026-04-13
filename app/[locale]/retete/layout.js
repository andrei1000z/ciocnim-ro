import Script from "next/script";
import { buildPageMetadata, buildBreadcrumb } from "../../lib/pageMeta";
import { getBaseUrl } from "../../lib/constants";
import { localizeSlug } from "../../i18n/config";
import { retete as reteteRo } from "./data";

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

  // Generez schema din data.js automat pentru toate rețetele (15 acum)
  const recipeListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Rețete Tradiționale de Paște",
    "description": "Colecție de rețete tradiționale pentru masa de Paște",
    "url": url,
    "numberOfItems": reteteRo.length,
    "itemListElement": reteteRo.map((r, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Recipe",
        "name": r.name,
        "description": r.description,
        "prepTime": r.prepTime || "PT30M",
        "cookTime": r.cookTime || "PT1H",
        "totalTime": r.totalTime || "PT1H30M",
        "recipeYield": `${r.servings || 4} ${r.servingsUnit || 'porții'}`,
        "recipeCategory": r.name,
        "recipeCuisine": "Română",
        "keywords": `${r.id}, paste, traditional, romanesc`,
        "image": `${baseUrl}/og-image.jpg`,
        "url": `${url}#${r.id}`,
        "author": { "@type": "Organization", "name": "Ciocnim.ro" },
        "inLanguage": locale,
        "nutrition": {
          "@type": "NutritionInformation",
          "calories": `${r.calories || 0} kcal`,
        },
      },
    })),
  };

  return (
    <>
      <Script id="breadcrumb-retete" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Script id="schema-retete" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeListSchema) }} />
      {children}
    </>
  );
}
