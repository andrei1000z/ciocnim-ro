import Script from "next/script";
import { buildPageMetadata, buildBreadcrumb } from "../../lib/pageMeta";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, slugKey: 'despre' });
}

export default async function DespreLayout({ children, params }) {
  const { locale } = await params;
  const breadcrumb = await buildBreadcrumb({ locale, slugKey: 'despre' });
  return (
    <>
      <Script id="breadcrumb-despre" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
