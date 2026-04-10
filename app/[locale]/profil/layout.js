import { BASE_URL } from '../../lib/constants';
import { locales } from '../../i18n/config';

const year = new Date().getFullYear();
const path = '/profil';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: { absolute: "Profilul Meu – Statistici și Realizări | Ciocnim.ro" },
    description: `Vezi realizările tale, statisticile de meciuri și insignele câștigate în jocul de ciocnit ouă de Paște ${year}. Ciocnim.ro - Păstrăm Tradiția.`,
    robots: { index: false, follow: false },
    openGraph: {
      title: `Profilul Meu – Ciocnim.ro`,
      description: `Statistici și realizări la ciocnit ouă online.`,
      url: `${BASE_URL}/${locale}${path}`,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
      type: "profile",
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}${path}`,
      languages: Object.fromEntries(
        locales.map(l => [l, `${BASE_URL}/${l}${path}`])
      ),
    },
  };
}

export default function ProfilLayout({ children }) {
  return children;
}
