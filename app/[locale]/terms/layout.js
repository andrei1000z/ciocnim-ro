import { BASE_URL } from '../../lib/constants';
import { locales } from '../../i18n/config';

const path = '/terms';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: { absolute: "Termeni și Condiții | Ciocnim.ro" },
    description: "Termenii și condițiile de utilizare a platformei Ciocnim.ro — regulile jocului, responsabilități și drepturi.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${BASE_URL}/${locale}${path}`,
      languages: Object.fromEntries(
        locales.map(l => [l, `${BASE_URL}/${l}${path}`])
      ),
    },
  };
}

export default function TermsLayout({ children }) {
  return children;
}
