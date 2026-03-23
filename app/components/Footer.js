import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-red-900/10 bg-white/[0.02] py-6 px-6 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <span>&copy; {new Date().getFullYear()} Ciocnim.ro</span>
        <nav aria-label="Footer" className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-red-400 transition-colors">Confidențialitate</Link>
          <Link href="/terms" className="hover:text-red-400 transition-colors">Termeni</Link>
          <Link href="/" className="hover:text-red-400 transition-colors">Acasă</Link>
        </nav>
      </div>
    </footer>
  );
}
