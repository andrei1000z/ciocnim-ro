const year = new Date().getFullYear();

export const metadata = {
  title: { absolute: "Profilul Meu – Statistici și Realizări | Ciocnim.ro" },
  description: `Vezi realizările tale, statisticile de meciuri și insignele câștigate în jocul de ciocnit ouă de Paște ${year}. Ciocnim.ro - Păstrăm Tradiția.`,
  robots: { index: false, follow: false },
  openGraph: {
    title: `Profilul Meu – Ciocnim.ro`,
    description: `Statistici și realizări la ciocnit ouă online.`,
    url: "https://ciocnim.ro/profil",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "profile",
  },
  alternates: { canonical: "https://ciocnim.ro/profil" },
  robots: { index: false, follow: false },
};

export default function ProfilLayout({ children }) {
  return children;
}
