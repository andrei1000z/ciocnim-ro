export const metadata = {
  title: "Când Pică Paștele în 2026, 2027, 2028? – Calendar Ortodox și Catolic",
  description:
    "Calendarul complet al Paștelui Ortodox și Catolic până în 2030. Află de ce data se schimbă în fiecare an, cum se calculează și când pică în același weekend. Planifică Paștele 2026 din timp!",
  keywords: [
    "cand pica pastele 2026", "data pastele ortodox 2026", "pastele catolic 2026",
    "calendar paste ortodox", "calculator data paste", "paste 2027 data",
    "paste 2028 aceeasi zi", "cand e paste 2026 romania",
    "saptamana mare 2026", "paste ortodox si catolic"
  ],
  openGraph: {
    title: "Calendar Paște 2026–2030 – Ortodox și Catolic",
    description:
      "Verifică exact când pică Paștele în fiecare an și descoperă de ce data se schimbă. Calendar ortodox și catolic complet.",
    url: "https://ciocnim.ro/calendar",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Calendar Paște – Ciocnim.ro" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Când Pică Paștele? Calendar Ortodox și Catolic 2026–2030 | Ciocnim.ro",
    description: "Data exactă a Paștelui Ortodox și Catolic pentru 2026, 2027, 2028, 2029 și 2030.",
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "https://ciocnim.ro/calendar" },
};

export default function CalendarLayout({ children }) {
  return children;
}
