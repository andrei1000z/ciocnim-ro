import Link from "next/link";
import PageHeader from "./components/PageHeader";

export const metadata = {
  title: "404 – Pagina nu există | Ciocnim.ro",
  description: "Oul pe care îl cauți s-a spart la ciocnit. Întoarce-te acasă și încearcă din nou!",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-main text-body flex flex-col">
      <PageHeader />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-8">
        <div className="space-y-4">
          <div className="text-8xl" role="img" aria-label="Ou spart">🥚</div>
          <h1 className="text-5xl md:text-7xl font-black text-white">404</h1>
          <p className="text-xl md:text-2xl font-bold text-red-400">Oul a fost ciocnit prea tare!</p>
          <p className="text-gray-500 font-medium text-sm md:text-base max-w-sm mx-auto">
            Pagina pe care o cauți s-a spart la ciocnit și nu mai există. Hai înapoi la masa de Paște!
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/"
            className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg"
          >
            <span role="img" aria-label="Ou de Paște">🥚</span> Ciocnește ouă online
          </Link>
          <Link href="/traditii" className="text-sm text-gray-400 hover:text-red-400 transition-colors">
            sau descoperă tradițiile de Paște →
          </Link>
        </div>

        {/* Easter egg decoration */}
        <div className="flex items-center gap-3 mt-8 opacity-20">
          <span className="text-2xl rotate-12" role="img" aria-label="Ou decorat">🥚</span>
          <span className="text-3xl -rotate-6" role="img" aria-label="Ou decorat">🥚</span>
          <span className="text-2xl rotate-3" role="img" aria-label="Ou decorat">🥚</span>
        </div>
      </div>
    </main>
  );
}
