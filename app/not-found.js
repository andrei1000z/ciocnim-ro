import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0c0a0a] text-gray-200 flex flex-col">

      <div className="w-full flex justify-between items-center p-6 md:p-8 bg-[#141111] shadow-lg shadow-black/20 border-b border-red-900/20">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl group-hover:scale-110 transition-all">🥚</span>
          <span className="font-bold text-xl md:text-2xl text-white">Ciocnim<span className="text-red-500">.ro</span></span>
        </Link>
        <Link href="/" className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95">
          Înapoi acasă
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-8">
        <div className="space-y-4">
          <div className="text-8xl">🥚</div>
          <h1 className="text-5xl md:text-7xl font-black text-white">404</h1>
          <p className="text-xl md:text-2xl font-bold text-red-400">Nu există această pagină</p>
          <p className="text-gray-500 font-medium text-sm md:text-base max-w-sm mx-auto">
            Oul pe care îl cauți s-a spart la ciocnit. Întoarce-te acasă și încearcă din nou!
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg"
        >
          🥚 Ciocnește ouă online
        </Link>
      </div>

    </main>
  );
}
