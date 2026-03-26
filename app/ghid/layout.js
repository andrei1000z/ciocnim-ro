export const metadata = {
  title: "Ghid de Joc",
  description: "Ghid complet pentru ciocnit ouă online pe Ciocnim.ro. Cum joci, cum câștigi, cum creezi grupuri și cum deblochezi achievement-uri.",
  openGraph: {
    title: "Ghid de Joc – Ciocnim.ro",
    description: "Învață să joci ciocnit ouă online: reguli, trucuri și ghid pas cu pas.",
    url: "https://ciocnim.ro/ghid",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://ciocnim.ro/ghid" },
};

export default function GhidLayout({ children }) {
  return children;
}
