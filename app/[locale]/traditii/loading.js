export default function TraditiiLoading() {
  return (
    <main className="min-h-screen bg-main text-body">
      <div className="w-full flex justify-between items-center p-6 md:p-8 bg-surface shadow-lg shadow-black/20 border-b border-edge-strong">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🥚</span>
          <span className="font-bold text-xl md:text-2xl text-heading">Ciocnim<span className="text-accent-red-strong">.ro</span></span>
        </div>
        <div className="w-32 h-10 bg-elevated rounded-lg animate-pulse" />
      </div>
      <div className="w-full max-w-3xl mx-auto pt-8 pb-16 px-6 space-y-6">
        <div className="text-center space-y-3">
          <div className="h-10 w-64 bg-elevated rounded-xl mx-auto animate-pulse" />
          <div className="h-4 w-80 bg-elevated rounded mx-auto animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border border-edge rounded-2xl p-6 h-24 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      </div>
    </main>
  );
}
