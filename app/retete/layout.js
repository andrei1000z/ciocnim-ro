const year = new Date().getFullYear();

export const metadata = {
  title: `Rețete Tradiționale de Paște ${year} – Cozonac, Drob, Pască, Miel`,
  description: `Cele mai bune rețete tradiționale de Paște ${year}: cozonac pufos, drob de miel, pască cu brânză, friptură de miel. Pas cu pas, cu ingrediente scalabile și timp de preparare.`,
  keywords: [
    `retete paste ${year}`, "cozonac reteta", "drob de miel reteta",
    "pasca cu branza reteta", "friptura de miel paste",
    "retete traditionale paste", "retete romanesti paste",
    `cozonac ${year}`, `drob ${year}`, "retete pascale"
  ],
  openGraph: {
    title: `Rețete Tradiționale de Paște ${year} – Cozonac, Drob, Pască, Miel`,
    description: `Rețetele clasice ale mesei de Paște ${year}: cozonac, drob, pască și friptură de miel. Ghid complet pas cu pas.`,
    url: "https://ciocnim.ro/retete",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Rețete de Paște – Ciocnim.ro" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `Rețete de Paște ${year} – Cozonac, Drob, Pască | Ciocnim.ro`,
    description: `Rețete tradiționale românești de Paște: cozonac pufos, drob, pască, miel. Pas cu pas!`,
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "https://ciocnim.ro/retete" },
};

export default function ReteteLayout({ children }) {
  return children;
}
