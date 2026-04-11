import Script from "next/script";
import { buildPageMetadata, buildBreadcrumb } from "../../lib/pageMeta";
import { getBaseUrl } from "../../lib/constants";
import { localizeSlug } from "../../i18n/config";
import { getDictionary } from "../../i18n/getDictionary";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, slugKey: 'clasament', ogType: 'website' });
}

export default async function ClasamentLayout({ children, params }) {
  const { locale } = await params;
  const baseUrl = await getBaseUrl();
  const slug = localizeSlug('clasament', locale);
  const url = `${baseUrl}/${locale}/${slug}`;
  const year = new Date().getFullYear();

  const dict = await getDictionary(locale);
  const meta = dict?.content?.pageMeta?.clasament || {};
  const schemaName = (meta.title || '').replace('{year}', year);
  const schemaDesc = (meta.description || '').replace('{year}', year);

  const breadcrumb = await buildBreadcrumb({ locale, slugKey: 'clasament' });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": schemaName,
    "description": schemaDesc,
    "url": url,
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
