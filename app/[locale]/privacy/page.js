"use client";

import LocaleLink from "../../components/LocaleLink";
import { useT } from "../../i18n/useT";

export default function PrivacyPage() {
  const t = useT();

  return (
    <main className="min-h-screen bg-main text-body">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <LocaleLink href="/" className="text-red-400 hover:text-red-300 transition-colors text-sm font-bold">← Acasă</LocaleLink>
        </div>

        <h1 className="text-3xl font-black text-heading">{t('content.privacy.pageTitle')}</h1>
        <p className="text-xs text-muted">{t('content.privacy.lastUpdated')}: 20 martie 2026</p>

        <section className="space-y-4 text-sm text-body leading-relaxed">
          <h2 className="text-lg font-bold text-heading mt-6">1. Ce date colectăm</h2>
          <p>Ciocnim.ro este un joc gratuit de Paște. Colectăm minimal de date, strict necesare funcționării jocului:</p>
          <ul className="list-disc list-inside space-y-1 text-dim">
            <li><strong className="text-body">Porecla</strong> — aleasă de tine, stocată local și pe server pentru clasamente.</li>
            <li><strong className="text-body">Statistici de joc</strong> — victorii, înfrângeri, achievement-uri.</li>
            <li><strong className="text-body">Regiunea selectată</strong> — pentru clasamentul regional.</li>
            <li><strong className="text-body">Identificator anonim</strong> — un ID generat aleatoriu pentru numărarea utilizatorilor online (nu conține date personale).</li>
          </ul>

          <h2 className="text-lg font-bold text-heading mt-6">2. Cum folosim datele</h2>
          <p>Datele sunt folosite exclusiv pentru:</p>
          <ul className="list-disc list-inside space-y-1 text-dim">
            <li>Funcționarea jocului multiplayer în timp real.</li>
            <li>Afișarea clasamentelor și achievement-urilor.</li>
            <li>Numărarea utilizatorilor online.</li>
          </ul>

          <h2 className="text-lg font-bold text-heading mt-6">3. Stocarea datelor</h2>
          <p>Datele locale (porecla, preferințele, tema) sunt salvate în <code className="text-red-400">localStorage</code> al browserului tău. Datele de clasament sunt stocate pe servere securizate (Upstash Redis) cu TTL (expirare automată).</p>

          <h2 className="text-lg font-bold text-heading mt-6">4. Cookies și tehnologii similare</h2>
          <p>Ciocnim.ro folosește <code className="text-red-400">localStorage</code> pentru a salva preferințele tale (tema, porecla, statistici). Nu folosim cookies de tracking sau analytics de la terți.</p>

          <h2 className="text-lg font-bold text-heading mt-6">5. Partajarea datelor</h2>
          <p>Nu vindem, nu partajăm și nu transmitem date personale către terți. Serviciile folosite (Pusher pentru WebSocket, Vercel pentru hosting) procesează date tehnice conform propriilor politici de confidențialitate.</p>

          <h2 className="text-lg font-bold text-heading mt-6">6. Drepturile tale (GDPR)</h2>
          <p>Conform regulamentului GDPR, ai dreptul de a:</p>
          <ul className="list-disc list-inside space-y-1 text-dim">
            <li>Accesa datele tale — vezi-ți profilul în aplicație.</li>
            <li>Șterge datele — golește localStorage-ul din browser sau contactează-ne.</li>
            <li>Rectifica datele — schimbă-ți porecla oricând.</li>
          </ul>

          <h2 className="text-lg font-bold text-heading mt-6">7. Contact</h2>
          <p>Pentru întrebări legate de confidențialitate, scrie-ne la <a href="mailto:ciocnim@mail.com" className="text-red-400 hover:text-red-300 transition-colors">ciocnim@mail.com</a>.</p>
        </section>

        <div className="pt-8 border-t border-red-900/20">
          <LocaleLink href="/" className="text-sm text-dim hover:text-red-400 transition-colors font-bold">← Înapoi la joc</LocaleLink>
        </div>
      </div>
    </main>
  );
}
