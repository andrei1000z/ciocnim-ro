export const metadata = {
  title: "Rețete Tradiționale de Paște – Cozonac, Drob, Pască, Miel",
  description: "Cele mai bune rețete tradiționale de Paște: cozonac pufos, drob de miel, pască cu brânză, friptură de miel. Pas cu pas, cu ingrediente scalabile și timp de preparare.",
  openGraph: {
    title: "Rețete Tradiționale de Paște – Cozonac, Drob, Pască, Miel",
    description: "Rețetele clasice ale mesei de Paște: cozonac, drob, pască și friptură de miel. Ghid complet pas cu pas.",
    url: "https://ciocnim.ro/retete",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Rețete de Paște – Ciocnim.ro" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rețete de Paște – Cozonac, Drob, Pască | Ciocnim.ro",
    description: "Rețete tradiționale românești de Paște: cozonac pufos, drob, pască, miel. Pas cu pas!",
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "https://ciocnim.ro/retete" },
};

export default function ReteteLayout({ children }) {
  return children;
}
