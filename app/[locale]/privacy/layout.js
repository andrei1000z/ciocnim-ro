import { buildPageMetadata } from "../../lib/pageMeta";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, slugKey: 'privacy', noindex: true });
}

export default function PrivacyLayout({ children }) {
  return children;
}
