export const metadata = {
  title: "Tradiția Ciocnitului de Ouă – Reguli, Semnificații și Obiceiuri de Paște",
  description:
    "De ce ciocnim ouă de Paște? Descoperă semnificația tradiției, culorile ouălor, regulile corecte ale jocului și obiceiurile pascale românești transmise din generație în generație.",
  keywords: [
    "traditii ciocnit oua", "semnificatia ciocnitului", "reguli ciocnit oua",
    "obiceiuri paste romanesti", "traditii pascale", "de ce ciocnim oua",
    "ou rosu semnificatie", "paste ortodox traditii", "obiceiuri din stramosi",
    "traditii romanesti paste 2026"
  ],
  openGraph: {
    title: "Tradiția Ciocnitului de Ouă – Origini, Reguli și Semnificații",
    description:
      "Cine ține oul mai tare? Află tot ce trebuie să știi despre tradiția românească a ciocnitului de ouă — de la origini până la regulile mesei de Paște.",
    url: "https://ciocnim.ro/traditii",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Tradiții Paște – Ciocnim.ro" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tradiția Ciocnitului de Ouă – Reguli și Semnificații | Ciocnim.ro",
    description: "Descoperă de ce ciocnim ouă, ce semnifică culorile și cum câștigi la masa de Paște.",
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "https://ciocnim.ro/traditii" },
};

export default function TraditiiLayout({ children }) {
  return children;
}
