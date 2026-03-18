const year = new Date().getFullYear();

export const metadata = {
  title: `Cum Vopsești Ouă Natural ${year} – Rețete cu Foi de Ceapă, Curcumă și Varză`,
  description: `Ghid complet pas cu pas pentru vopsit ouă natural acasă în ${year}, fără chimicale. Ouă roșii cu foi de ceapă, galben cu curcumă, albastru cu varză roșie. Rețetele tradiționale ale bunicii.`,
  keywords: [
    "vopsit oua natural", "oua rosii foi de ceapa", "cum vopsesti oua acasa",
    "vopsit oua curcuma", "vopsit oua varza rosie", "oua naturale paste",
    `retete vopsit oua ${year}`, "oua fara chimicale", "traditie vopsit oua romanesc",
    `culori naturale oua paste ${year}`
  ],
  openGraph: {
    title: `Cum Vopsești Ouă Natural – Ghid Complet Paște ${year}`,
    description: `Secretul bunicilor: ouă roșii cu foi de ceapă, galben cu curcumă, albastru cu varză roșie. Fără chimicale, 100% natural!`,
    url: "https://ciocnim.ro/vopsit-natural",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Vopsit Natural Ouă – Ciocnim.ro" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `Vopsit Ouă Natural ${year} – Rețete Tradiționale fără Chimicale | Ciocnim.ro`,
    description: `Ouă roșii cu foi de ceapă, galben cu curcumă, albastru cu varză. Ghid complet pentru Paștele ${year}.`,
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "https://ciocnim.ro/vopsit-natural" },
};

export default function VopsitNaturalLayout({ children }) {
  return children;
}
