import Script from "next/script";
import { buildPageMetadata, buildBreadcrumb } from "../../lib/pageMeta";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, slugKey: 'traditii' });
}

export default async function TraditiiLayout({ children, params }) {
  const { locale } = await params;
  const breadcrumb = await buildBreadcrumb({ locale, slugKey: 'traditii' });
  return (
    <>
      <Script id="breadcrumb-traditii" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
