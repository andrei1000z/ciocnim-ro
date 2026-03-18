const year = new Date().getFullYear();

export const metadata = {
  title: `Mesaje și Urări de Paște ${year} – Frumoase, Scurte și Gata de Trimis`,
  description: `Cele mai frumoase mesaje de Paște ${year} pentru familie și prieteni. Copiază și trimite pe WhatsApp, Instagram sau Facebook urări tradiționale și moderne. Hristos a Înviat!`,
  keywords: [
    `mesaje de paste ${year}`, "urari de paste", "mesaje hristos a inviat",
    "urari paste whatsapp", "mesaje scurte paste", "felicitari pascale",
    "urari traditionale romanesti", "texte frumoase de paste",
    `mesaje paste familie`, `statusuri paste ${year}`
  ],
  openGraph: {
    title: `Mesaje și Urări de Paște ${year} – Copiază și Trimite Instant`,
    description: `Găsește mesajul perfect de Paște ${year} pentru cei dragi. Scurte, frumoase, din suflet — gata de trimis pe WhatsApp sau Instagram.`,
    url: "https://ciocnim.ro/urari",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Urări de Paște – Ciocnim.ro" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `Mesaje de Paște ${year} – Cele Mai Frumoase Urări | Ciocnim.ro`,
    description: `Copiază urările tale de Paște și trimite lumina celor dragi. Hristos a Înviat!`,
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "https://ciocnim.ro/urari" },
};

export default function UrariLayout({ children }) {
  return children;
}
