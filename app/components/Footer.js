export default function Footer() {
  return (
    <footer className="w-full border-t border-red-900/10 bg-card py-6 px-6 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-faint">
        <span>&copy; {new Date().getFullYear()} Ciocnim.ro — Jocul tradițional de Paște, acum online.</span>
        <span className="text-red-500/30">Hristos a Înviat! 🥚</span>
      </div>
    </footer>
  );
}
