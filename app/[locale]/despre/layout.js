export const metadata = {
  title: "Despre Ciocnim.ro",
  description: "Povestea Ciocnim.ro — cum a luat naștere jocul tradițional de ciocnit ouă online. Echipa, misiunea și tehnologia din spatele proiectului.",
  openGraph: {
    title: "Despre Ciocnim.ro – Povestea Noastră",
    description: "Cum am transformat tradiția ciocnitului de ouă într-un joc online pentru toată familia.",
    url: "https://ciocnim.ro/despre",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://ciocnim.ro/despre" },
};

export default function DespreLayout({ children }) {
  return children;
}
