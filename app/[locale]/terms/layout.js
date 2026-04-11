import { buildPageMetadata } from "../../lib/pageMeta";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, slugKey: 'terms', noindex: true });
}

export default function TermsLayout({ children }) {
  return children;
}
