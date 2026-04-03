"use client";

import LocaleLink from "../../components/LocaleLink";
import { useT } from "../../i18n/useT";

export default function TermsPage() {
  const t = useT();

  return (
    <main className="min-h-screen bg-main text-body">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <LocaleLink href="/" className="text-red-400 hover:text-red-300 transition-colors text-sm font-bold">← Acasă</LocaleLink>
        </div>

        <h1 className="text-3xl font-black text-heading">{t('content.terms.pageTitle')}</h1>
        <p className="text-xs text-muted">{t('content.terms.lastUpdated')}: 20 martie 2026</p>

        <section className="space-y-4 text-sm text-body leading-relaxed">
          <h2 className="text-lg font-bold text-heading mt-6">1. Descrierea serviciului</h2>
          <p>Ciocnim.ro este un joc online gratuit care simulează tradiția românească de ciocnit ouă de Paște. Jocul este disponibil prin browser, fără instalare, pe orice dispozitiv.</p>

          <h2 className="text-lg font-bold text-heading mt-6">2. Utilizarea serviciului</h2>
          <ul className="list-disc list-inside space-y-1 text-dim">
            <li>Jocul este gratuit și nu necesită înregistrare cu date personale reale.</li>
            <li>Alegi o poreclă (pseudonim) pentru a juca. Aceasta nu trebuie să conțină limbaj vulgar sau ofensator.</li>
            <li>Este interzisă utilizarea jocului pentru hărțuire, spam sau orice activitate malițioasă.</li>
          </ul>

          <h2 className="text-lg font-bold text-heading mt-6">3. Conținut generat de utilizatori</h2>
          <p>Mesajele din chat și poreclele sunt conținut generat de utilizatori. Ne rezervăm dreptul de a filtra automat conținutul vulgar și de a restricționa accesul utilizatorilor care încalcă regulile.</p>

          <h2 className="text-lg font-bold text-heading mt-6">4. Proprietate intelectuală</h2>
          <p>Designul, codul sursă, grafica și conținutul Ciocnim.ro sunt proprietatea echipei Ciocnim.ro. Tradițiile de Paște descrise aparțin moștenirii culturale românești.</p>

          <h2 className="text-lg font-bold text-heading mt-6">5. Limitarea responsabilității</h2>
          <p>Ciocnim.ro este oferit &ldquo;așa cum este&rdquo;. Nu garantăm disponibilitatea permanentă a serviciului. Rezultatele jocului sunt aleatorii (50/50) și nu implică câștiguri reale.</p>

          <h2 className="text-lg font-bold text-heading mt-6">6. Modificări</h2>
          <p>Ne rezervăm dreptul de a modifica acești termeni. Continuarea utilizării serviciului după modificări constituie acceptarea noilor termeni.</p>

          <h2 className="text-lg font-bold text-heading mt-6">7. Contact</h2>
          <p>Pentru întrebări, scrie-ne la <a href="mailto:ciocnim@mail.com" className="text-red-400 hover:text-red-300 transition-colors">ciocnim@mail.com</a>.</p>
        </section>

        <div className="pt-8 border-t border-red-900/20">
          <LocaleLink href="/" className="text-sm text-dim hover:text-red-400 transition-colors font-bold">← Înapoi la joc</LocaleLink>
        </div>
      </div>
    </main>
  );
}
