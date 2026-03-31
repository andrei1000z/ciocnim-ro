import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-red-900/10 bg-card pt-8 pb-6 px-6 mt-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Content links grid — helps crawlers discover all pages */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-2">
            <p className="font-black text-red-500/50 uppercase tracking-widest text-xs">Joc</p>
            <nav className="flex flex-col gap-1.5" aria-label="Joc">
              <Link href="/" className="text-muted hover:text-red-400 transition-colors">Joacă Acum</Link>
              <Link href="/ghid" className="text-muted hover:text-red-400 transition-colors">Ghid de Joc</Link>
              <Link href="/clasament" className="text-muted hover:text-red-400 transition-colors">Clasament</Link>
            </nav>
          </div>
          <div className="space-y-2">
            <p className="font-black text-red-500/50 uppercase tracking-widest text-xs">Tradiții</p>
            <nav className="flex flex-col gap-1.5" aria-label="Traditii">
              <Link href="/traditii" className="text-muted hover:text-red-400 transition-colors">Tradiții Pascale</Link>
              <Link href="/urari" className="text-muted hover:text-red-400 transition-colors">Urări de Paște</Link>
              <Link href="/calendar" className="text-muted hover:text-red-400 transition-colors">Calendar Paște</Link>
            </nav>
          </div>
          <div className="space-y-2">
            <p className="font-black text-red-500/50 uppercase tracking-widest text-xs">Rețete</p>
            <nav className="flex flex-col gap-1.5" aria-label="Retete">
              <Link href="/retete" className="text-muted hover:text-red-400 transition-colors">Rețete de Paște</Link>
              <Link href="/vopsit-natural" className="text-muted hover:text-red-400 transition-colors">Vopsit Natural Ouă</Link>
            </nav>
          </div>
          <div className="space-y-2">
            <p className="font-black text-red-500/50 uppercase tracking-widest text-xs">Info</p>
            <nav className="flex flex-col gap-1.5" aria-label="Info">
              <Link href="/despre" className="text-muted hover:text-red-400 transition-colors">Despre Noi</Link>
              <Link href="/privacy" className="text-muted hover:text-red-400 transition-colors">Confidențialitate</Link>
              <Link href="/terms" className="text-muted hover:text-red-400 transition-colors">Termeni</Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-red-900/10 text-xs text-faint">
          <span>&copy; {new Date().getFullYear()} Ciocnim.ro — Jocul tradițional de Paște, acum online.</span>
          <span className="text-red-500/30">Hristos a Înviat! 🥚</span>
        </div>
      </div>
    </footer>
  );
}
