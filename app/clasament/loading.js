export default function ClasamentLoading() {
  return (
    <main className="min-h-screen bg-main text-body">
      <div className="w-full flex justify-between items-center p-6 md:p-8 bg-surface shadow-lg shadow-black/20 border-b border-edge-strong">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🥚</span>
          <span className="font-bold text-xl md:text-2xl text-heading">Ciocnim<span className="text-accent-red-strong">.ro</span></span>
        </div>
        <div className="w-32 h-10 bg-elevated rounded-lg animate-pulse" />
      </div>
      <div className="w-full max-w-2xl mx-auto pt-8 pb-16 px-6 space-y-6">
        <div className="text-center space-y-3">
          <div className="h-10 w-64 bg-elevated rounded-xl mx-auto animate-pulse" />
          <div className="h-4 w-48 bg-elevated rounded mx-auto animate-pulse" />
        </div>
        <div className="rounded-2xl border border-edge bg-card p-4 animate-pulse h-16" />
        <div className="flex rounded-2xl overflow-hidden border border-edge bg-card h-12 animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-elevated rounded-xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      </div>
    </main>
  );
}
