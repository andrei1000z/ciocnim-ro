import Link from "next/link";

export default function PageHeader() {
  return (
    <div className="w-full flex justify-between items-center p-6 md:p-8 bg-white shadow-lg border-b-4 border-red-700">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-3xl group-hover:scale-110 transition-all">🥚</span>
        <span className="font-bold text-xl md:text-2xl text-red-900">Ciocnim<span className="text-red-600">.ro</span></span>
      </Link>
      <Link href="/" className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg border-2 border-red-900 hover:bg-red-800 transition-all active:scale-95">
        Înapoi acasă
      </Link>
    </div>
  );
}
