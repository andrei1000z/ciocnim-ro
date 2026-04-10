import { BASE_URL } from '../../lib/constants';
import { locales } from '../../i18n/config';

const path = '/privacy';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: { absolute: "Politica de Confidențialitate | Ciocnim.ro" },
    description: "Politica de confidențialitate Ciocnim.ro — cum colectăm și folosim datele, conformitate GDPR, drepturile utilizatorilor.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${BASE_URL}/${locale}${path}`,
      languages: Object.fromEntries(
        locales.map(l => [l, `${BASE_URL}/${l}${path}`])
      ),
    },
  };
}

export default function PrivacyLayout({ children }) {
  return children;
}
