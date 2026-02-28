import { Outfit } from "next/font/google";
import "./globals.css";

// Alegem un font modern, rotund, foarte "friendly" pentru jocuri
const fontOutfit = Outfit({ 
  subsets: ["latin"],
  weight: ['300', '400', '600', '700', '900']
});

// AICI ESTE SECRETUL VIRALITĂȚII: Ce vede lumea când dai share pe WhatsApp/Facebook
export const metadata = {
  title: "Ciocnim.ro 🥚 | Tradiția de Paște online",
  description: "Alege-ți oul, strânge telefonul și sparge oul prietenilor tăi! O experiență 100% românească. Hristos a înviat!",
  keywords: ["ciocnit oua", "paste", "joc paste", "ciocnim", "traditie paste", "romania"],
  openGraph: {
    title: "Ciocnim.ro 🥚 | Tradiția de Paște online",
    description: "Te provoc la un duel de ciocnit ouă! Intră să-ți alegi armura și arată-ne ce poți. 50/50 șanse.",
    url: "https://ciocnim.netlify.app", // Pune linkul tău final aici
    siteName: "Ciocnim.ro",
    locale: "ro_RO",
    type: "website",
  },
  themeColor: "#dc2626", // Face bara de sus de la browserul telefonului roșie!
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body className={`${fontOutfit.className} antialiased selection:bg-yellow-500 selection:text-black`}>
        {children}
      </body>
    </html>
  );
}