import { Outfit } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper"; // Cream un wrapper pentru logica de client

const fontOutfit = Outfit({ subsets: ["latin"], weight: ['400', '700', '900'] });

export const metadata = {
  title: "Ciocnim.ro 🥚 | Arena Echipelor",
  description: "Creează-ți echipa, chat-uiește cu prietenii și ciocniți ouă online!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body className={`${fontOutfit.className} bg-[#0a0000] text-white antialiased`}>
        {/* Folosim un component de client separat pentru a nu bloca randarea serverului */}
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}