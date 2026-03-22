import Link from "next/link";

export default function PageHeader() {
  return (
    <div className="w-full flex justify-between items-center p-6 md:p-8 bg-surface shadow-lg shadow-black/20 border-b border-edge-strong transition-colors duration-300">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-3xl group-hover:scale-110 transition-all">🥚</span>
        <span className="font-bold text-xl md:text-2xl text-heading">Ciocnim<span className="text-accent-red-strong">.ro</span></span>
      </Link>
      <Link href="/" className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95">
        Înapoi acasă
      </Link>
    </div>
  );
}
