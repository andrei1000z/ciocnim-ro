import Script from "next/script";
import { buildPageMetadata, buildBreadcrumb } from "../../lib/pageMeta";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, slugKey: 'calendar' });
}

export default async function CalendarLayout({ children, params }) {
  const { locale } = await params;
  const breadcrumb = await buildBreadcrumb({ locale, slugKey: 'calendar' });
  return (
    <>
      <Script id="breadcrumb-calendar" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
