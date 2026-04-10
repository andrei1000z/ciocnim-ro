export const metadata = {
  title: "404 – Pagina nu există | Ciocnim.ro",
  description: "Oul pe care îl cauți s-a spart la ciocnit. Întoarce-te acasă și încearcă din nou!",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-main text-body flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-sm">
        <div className="text-8xl" role="img" aria-label="Ou spart">🥚</div>
        <h1 className="text-6xl md:text-8xl font-black text-heading">404</h1>
        <p className="text-xl md:text-2xl font-bold text-red-400">Oul a fost ciocnit prea tare!</p>
        <p className="text-muted font-medium text-sm md:text-base">
          Pagina pe care o cauți s-a spart la ciocnit și nu mai există. Hai înapoi la masa de Paște!
        </p>
        <a
          href="/ro"
          className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg"
        >
          🥚 Acasă
        </a>
      </div>
    </main>
  );
}
