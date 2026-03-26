const year = new Date().getFullYear();

export const metadata = {
  title: "Clasament Național",
  description: `Clasamentul complet al celor mai buni jucători și regiuni la ciocnit ouă de Paște ${year}. Vezi cine domină competiția pe ciocnim.ro!`,
  openGraph: {
    title: "Clasament Național – Ciocnim.ro",
    description: `Top jucători și regiuni la ciocnit ouă online, Paște ${year}.`,
    url: "https://ciocnim.ro/clasament",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://ciocnim.ro/clasament" },
};

export default function ClasamentLayout({ children }) {
  return children;
}
