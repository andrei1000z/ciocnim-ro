import { buildPageMetadata } from "../../lib/pageMeta";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, slugKey: 'profil', noindex: true, ogType: 'profile' });
}

export default function ProfilLayout({ children }) {
  return children;
}
