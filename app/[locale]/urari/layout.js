import Script from "next/script";
import { buildPageMetadata, buildBreadcrumb } from "../../lib/pageMeta";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, slugKey: 'urari' });
}

export default async function UrariLayout({ children, params }) {
  const { locale } = await params;
  const breadcrumb = await buildBreadcrumb({ locale, slugKey: 'urari' });
  return (
    <>
      <Script id="breadcrumb-urari" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
