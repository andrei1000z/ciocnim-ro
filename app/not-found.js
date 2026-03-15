import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 text-gray-900 flex flex-col">

      <div className="w-full flex justify-between items-center p-6 md:p-8 bg-white shadow-lg border-b-4 border-red-700">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl group-hover:scale-110 transition-all">🥚</span>
          <span className="font-bold text-xl md:text-2xl text-red-900">Ciocnim<span className="text-red-600">.ro</span></span>
        </Link>
        <Link href="/" className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg border-2 border-red-900 hover:bg-red-800 transition-all active:scale-95">
          Înapoi acasă
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-8">
        <div className="space-y-4">
          <div className="text-8xl">🥚</div>
          <h1 className="text-5xl md:text-7xl font-black text-red-900">404</h1>
          <p className="text-xl md:text-2xl font-bold text-red-800">Nu există această pagină</p>
          <p className="text-gray-500 font-medium text-sm md:text-base max-w-sm mx-auto">
            Oul pe care îl cauți s-a spart la ciocnit. Întoarce-te acasă și încearcă din nou!
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-red-700 text-white px-8 py-4 rounded-lg font-black text-lg border-4 border-red-900 hover:bg-red-800 transition-all active:scale-95 shadow-lg"
        >
          🥚 Ciocnește ouă online
        </Link>
      </div>

    </main>
  );
}
