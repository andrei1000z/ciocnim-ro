import Script from "next/script";
import { buildPageMetadata, buildBreadcrumb } from "../../lib/pageMeta";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, slugKey: 'ghid' });
}

export default async function GhidLayout({ children, params }) {
  const { locale } = await params;
  const breadcrumb = await buildBreadcrumb({ locale, slugKey: 'ghid' });
  return (
    <>
      <Script id="breadcrumb-ghid" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
