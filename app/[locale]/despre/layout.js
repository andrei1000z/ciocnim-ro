import { BASE_URL } from '../../lib/constants';
import { locales } from '../../i18n/config';

const path = '/despre';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: "Despre Ciocnim.ro",
    description: "Povestea Ciocnim.ro — cum a luat naștere jocul tradițional de ciocnit ouă online. Echipa, misiunea și tehnologia din spatele proiectului.",
    openGraph: {
      title: "Despre Ciocnim.ro – Povestea Noastră",
      description: "Cum am transformat tradiția ciocnitului de ouă într-un joc online pentru toată familia.",
      url: `${BASE_URL}/${locale}${path}`,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}${path}`,
      languages: Object.fromEntries(
        locales.map(l => [l, `${BASE_URL}/${l}${path}`])
      ),
    },
  };
}

export default function DespreLayout({ children }) {
  return children;
}
