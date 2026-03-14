export const metadata = {
  title: "Cum Vopsești Ouă Natural – Rețete cu Foi de Ceapă, Sfeclă și Afine",
  description:
    "Ghid complet pas cu pas pentru vopsit ouă natural acasă, fără chimicale. Ouă roșii cu foi de ceapă, mov cu sfeclă, albastru cu afine. Rețetele tradiționale ale bunicii pentru Paștele 2026.",
  keywords: [
    "vopsit oua natural", "oua rosii foi de ceapa", "cum vopsesti oua acasa",
    "vopsit oua sfecla", "vopsit oua afine", "oua naturale paste",
    "retete vopsit oua", "oua fara chimicale", "traditie vopsit oua romanesc",
    "culori naturale oua paste 2026"
  ],
  openGraph: {
    title: "Cum Vopsești Ouă Natural – Ghid Complet Paște 2026",
    description:
      "Secretul bunicilor: ouă roșii cu foi de ceapă, mov cu sfeclă roșie, aurii cu turmeric. Fără chimicale, 100% natural. Încearcă acum!",
    url: "https://ciocnim.ro/vopsit-natural",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Vopsit Natural Ouă – Ciocnim.ro" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vopsit Ouă Natural – Rețete Tradiționale fără Chimicale | Ciocnim.ro",
    description: "Ouă roșii cu foi de ceapă, mov cu sfeclă, albastru cu afine. Ghid complet pentru Paștele 2026.",
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "https://ciocnim.ro/vopsit-natural" },
};

export default function VopsitNaturalLayout({ children }) {
  return children;
}
