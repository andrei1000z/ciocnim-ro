"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Script from "next/script";

// ─── Safe localStorage ──────────────────────────────────────────────────────
const safeLS = {
  get: (key) => { try { return typeof window !== "undefined" ? localStorage.getItem(key) : null; } catch { return null; } },
  set: (key, val) => { try { if (typeof window !== "undefined") localStorage.setItem(key, val); } catch {} },
};

// ─── Recipe Data ────────────────────────────────────────────────────────────
const retete = [
  {
    id: "cozonac",
    name: "Cozonac Tradițional Pufos",
    icon: "🍞",
    description: "Cozonacul pufos, cu miez elastic și coajă aurie, este regele mesei de Paște. Rețeta clasică cu cacao și nucă.",
    prepTime: "PT40M",
    prepLabel: "40 min",
    cookTime: "PT50M",
    cookLabel: "50 min",
    totalTime: "PT4H",
    totalLabel: "~4h (cu dospire)",
    servings: 2,
    servingsUnit: "cozonaci",
    calories: 320,
    difficulty: "Mediu",
    difficultyColor: "text-yellow-400",
    image: "/og-image.jpg",
    baseIngredients: [
      { qty: 1, unit: "kg", name: "făină albă tip 000" },
      { qty: 10, unit: "buc", name: "gălbenușuri de ou" },
      { qty: 250, unit: "g", name: "zahăr" },
      { qty: 200, unit: "ml", name: "lapte călduț" },
      { qty: 150, unit: "g", name: "unt moale" },
      { qty: 50, unit: "g", name: "drojdie proaspătă" },
      { qty: 1, unit: "", name: "coajă rasă de lămâie" },
      { qty: 1, unit: "", name: "esență de vanilie" },
      { qty: 1, unit: "praf", name: "sare" },
    ],
    filling: [
      { qty: 300, unit: "g", name: "nucă măcinată" },
      { qty: 100, unit: "g", name: "zahăr" },
      { qty: 50, unit: "g", name: "cacao" },
      { qty: 3, unit: "linguri", name: "rom alimentar" },
    ],
    steps: [
      "Dizolvă drojdia în laptele călduț cu o linguriță de zahăr. Lasă 10 minute până face spumă.",
      "Amestecă făina cu zahărul și sarea. Adaugă gălbenușurile pe rând, drojdia dizolvată și frământă 15-20 minute.",
      "Încorporează untul moale bucată cu bucată, continuă să frământi până aluatul devine elastic și se desprinde de mâini.",
      "Adaugă coaja de lămâie și vanilia. Acoperă cu un prosop și lasă la dospit 1-2 ore (până se dublează).",
      "Prepară umplutura: amestecă nuca cu zahărul, cacaua și romul.",
      "Întinde aluatul în dreptunghi, presară umplutura uniform, apoi rulează strâns.",
      "Așează ruloul în tavă unsă cu unt și tapetată cu făină. Lasă la dospit încă 30-40 minute.",
      "Unge cu gălbenuș bătut cu puțin lapte. Coace la 170°C pentru 45-50 minute.",
      "Scoate din cuptor, lasă 10 minute în tavă, apoi răstoarnă pe un grătar. Acoperă cu un prosop curat."
    ]
  },
  {
    id: "drob",
    name: "Drob de Miel",
    icon: "🐑",
    description: "Drobul de miel este vedeta absolută a mesei de Paște. Aromat, suculent și plin de savoare, servit rece sau călduț.",
    prepTime: "PT30M",
    prepLabel: "30 min",
    cookTime: "PT60M",
    cookLabel: "60 min",
    totalTime: "PT1H30M",
    totalLabel: "~1.5h",
    servings: 8,
    servingsUnit: "porții",
    calories: 280,
    difficulty: "Mediu",
    difficultyColor: "text-yellow-400",
    image: "/og-image.jpg",
    baseIngredients: [
      { qty: 500, unit: "g", name: "organe de miel (ficat, inimă, plămâni, rinichi)" },
      { qty: 4, unit: "buc", name: "ouă" },
      { qty: 2, unit: "buc", name: "cepe mari" },
      { qty: 1, unit: "legătură", name: "mărar proaspăt" },
      { qty: 1, unit: "legătură", name: "pătrunjel proaspăt" },
      { qty: 1, unit: "legătură", name: "lob (leuștean)" },
      { qty: 3, unit: "linguri", name: "ulei de măsline" },
      { qty: 1, unit: "", name: "sare și piper după gust" },
      { qty: 100, unit: "ml", name: "lapte" },
      { qty: 2, unit: "linguri", name: "pesmet" },
    ],
    filling: [],
    steps: [
      "Spală bine organele de miel și fierbe-le în apă cu sare 20-25 de minute. Scurge și lasă să se răcească.",
      "Taie organele în cubulețe mici sau trece-le prin mașina de tocat (textură mai fină).",
      "Călește ceapa tăiată mărunt în ulei până devine translucidă.",
      "Amestecă organele tocate cu ceapa călită, verdețurile tăiate fin, ouăle bătute, laptele, sarea și piperul.",
      "Unge o tavă de cozonac cu ulei și presară pesmet pe fund și pereți.",
      "Toarnă compoziția în tavă. Decorează deasupra cu felii de ou fiert și frunze de verdeață.",
      "Coace la 180°C pentru 45-50 minute, până devine auriu deasupra.",
      "Lasă să se răcească complet în tavă înainte de a tăia felii. Se servește rece sau la temperatura camerei."
    ]
  },
  {
    id: "pasca",
    name: "Pască cu Brânză Dulce",
    icon: "🧀",
    description: "Pască tradițională cu brânză dulce de vaci, stafide și vanilie — desertul preferat alături de cozonac la masa de Paște.",
    prepTime: "PT30M",
    prepLabel: "30 min",
    cookTime: "PT45M",
    cookLabel: "45 min",
    totalTime: "PT3H",
    totalLabel: "~3h (cu dospire)",
    servings: 10,
    servingsUnit: "porții",
    calories: 290,
    difficulty: "Mediu",
    difficultyColor: "text-yellow-400",
    image: "/og-image.jpg",
    baseIngredients: [
      { qty: 500, unit: "g", name: "brânză dulce de vaci (scursă bine)" },
      { qty: 4, unit: "buc", name: "ouă" },
      { qty: 150, unit: "g", name: "zahăr" },
      { qty: 100, unit: "g", name: "stafide" },
      { qty: 100, unit: "g", name: "smântână" },
      { qty: 1, unit: "", name: "esență de vanilie" },
      { qty: 1, unit: "", name: "coajă rasă de lămâie" },
      { qty: 50, unit: "g", name: "griș" },
    ],
    filling: [],
    steps: [
      "Pregătește aluatul de cozonac (sau folosește aluat gata de pască). Tapetează o formă rotundă cu aluat pe fund și margini.",
      "Mixează brânza de vaci cu zahărul până devine cremoasă.",
      "Adaugă ouăle pe rând, mestecând după fiecare. Apoi smântâna, vanilia și coaja de lămâie.",
      "Încorporează grișul și stafidele (înmuiate 10 minute în apă caldă și scurse).",
      "Toarnă compoziția de brânză peste aluatul din formă.",
      "Decorează deasupra cu benzi de aluat în formă de cruce sau grilaj.",
      "Unge cu gălbenuș bătut. Coace la 170°C pentru 40-45 minute, până devine aurie.",
      "Lasă să se răcească complet în formă. Se servește rece, presărată cu zahăr pudră."
    ]
  },
  {
    id: "friptura-miel",
    name: "Friptură de Miel la Cuptor",
    icon: "🍖",
    description: "Friptura de miel la cuptor cu usturoi și rozmarin, fragedă și suculentă — piesa centrală a mesei festive de Paște.",
    prepTime: "PT20M",
    prepLabel: "20 min",
    cookTime: "PT2H",
    cookLabel: "2h",
    totalTime: "PT2H30M",
    totalLabel: "~2.5h",
    servings: 6,
    servingsUnit: "porții",
    calories: 350,
    difficulty: "Ușor",
    difficultyColor: "text-green-400",
    image: "/og-image.jpg",
    baseIngredients: [
      { qty: 1.5, unit: "kg", name: "pulpă sau spată de miel" },
      { qty: 8, unit: "căței", name: "usturoi" },
      { qty: 3, unit: "ramuri", name: "rozmarin proaspăt" },
      { qty: 3, unit: "linguri", name: "ulei de măsline" },
      { qty: 1, unit: "", name: "sare și piper după gust" },
      { qty: 2, unit: "buc", name: "cepe mari (tăiate în sferturi)" },
      { qty: 500, unit: "g", name: "cartofi (tăiați în sferturi)" },
      { qty: 200, unit: "ml", name: "vin alb sec" },
      { qty: 1, unit: "", name: "suc de la o lămâie" },
    ],
    filling: [],
    steps: [
      "Scoate carnea de miel la temperatura camerei cu 30 minute înainte de gătit.",
      "Fă tăieturi adânci în carne și introduce felii de usturoi și frunze de rozmarin în fiecare tăietură.",
      "Freacă carnea cu ulei de măsline, sare, piper și suc de lămâie.",
      "Așează ceapa și cartofii pe fundul tăvii. Pune carnea deasupra.",
      "Toarnă vinul în tavă. Acoperă strâns cu folie de aluminiu.",
      "Coace la 180°C acoperit timp de 1.5 ore. Apoi scoate folia și crește temperatura la 200°C.",
      "Coace neacoperit încă 30 minute, ungând ocazional cu sucul din tavă, până se rumenește frumos.",
      "Lasă carnea să se odihnească 15 minute acoperită cu folie înainte de a tăia. Servește cu legumele din tavă."
    ]
  }
];

// ─── Recipe Card (Grid View) ────────────────────────────────────────────────
const RecipeCard = ({ recipe, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    onClick={onClick}
    className="w-full text-left bg-white/[0.04] rounded-2xl border border-white/[0.06] hover:border-red-900/30 transition-all group overflow-hidden shadow-lg shadow-black/20 active:scale-[0.98]"
  >
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <span className="text-5xl">{recipe.icon}</span>
        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
          recipe.difficulty === "Ușor"
            ? "bg-green-900/20 text-green-400 border-green-900/30"
            : recipe.difficulty === "Mediu"
              ? "bg-yellow-900/20 text-yellow-400 border-yellow-900/30"
              : "bg-red-900/20 text-red-400 border-red-900/30"
        }`}>
          {recipe.difficulty}
        </span>
      </div>

      <div>
        <h2 className="text-xl font-black text-white group-hover:text-red-400 transition-colors">{recipe.name}</h2>
        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{recipe.description}</p>
      </div>

      <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
        <span className="flex items-center gap-1">⏱️ {recipe.totalLabel}</span>
        <span className="flex items-center gap-1">🍽️ {recipe.servings} {recipe.servingsUnit}</span>
        <span className="flex items-center gap-1">🔥 {recipe.calories} kcal</span>
      </div>
    </div>
  </motion.button>
);

// ─── Interactive Ingredient List ────────────────────────────────────────────
const IngredientList = ({ ingredients, multiplier, title }) => {
  if (!ingredients || ingredients.length === 0) return null;
  return (
    <div className="space-y-3">
      {title && <h4 className="text-sm font-bold uppercase tracking-widest text-red-400">{title}</h4>}
      {ingredients.map((ing, i) => (
        <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
          <span className="text-red-400 font-black text-base min-w-[60px] text-right">
            {ing.qty ? Math.round(ing.qty * multiplier * 10) / 10 : ""} {ing.unit}
          </span>
          <span className="text-gray-200 text-lg font-medium">{ing.name}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Step-by-Step with Checkboxes ───────────────────────────────────────────
const StepByStep = ({ steps, recipeId }) => {
  const storageKey = `c_recipe_${recipeId}`;
  const [checked, setChecked] = useState(() => {
    const saved = safeLS.get(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  const toggle = useCallback((idx) => {
    setChecked(prev => {
      const next = prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx];
      safeLS.set(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const resetAll = () => {
    setChecked([]);
    safeLS.set(storageKey, "[]");
  };

  const progress = steps.length > 0 ? Math.round((checked.length / steps.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-widest text-red-400">Mod Gătire</h4>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500">{progress}% completat</span>
          {checked.length > 0 && (
            <button onClick={resetAll} className="text-xs text-gray-500 hover:text-red-400 transition-colors font-bold">
              Resetează
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-red-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isDone = checked.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => toggle(idx)}
              className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${
                isDone
                  ? "bg-green-900/10 border-green-900/20"
                  : "bg-white/[0.02] border-white/[0.04] hover:border-red-900/20"
              }`}
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center text-sm font-bold mt-0.5 transition-all ${
                isDone
                  ? "bg-green-700 border-green-600 text-white"
                  : "border-gray-600 text-gray-500"
              }`}>
                {isDone ? "✓" : idx + 1}
              </span>
              <span className={`text-lg font-medium leading-relaxed transition-all ${
                isDone ? "text-gray-500 line-through" : "text-gray-200"
              }`}>
                {step}
              </span>
            </button>
          );
        })}
      </div>

      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4 bg-green-900/10 border border-green-900/20 rounded-2xl"
        >
          <p className="text-green-400 font-black text-lg">🎉 Felicitări! Rețeta este gata!</p>
        </motion.div>
      )}
    </div>
  );
};

// ─── Recipe Detail View ─────────────────────────────────────────────────────
const RecipeDetail = ({ recipe, onBack }) => {
  const [multiplier, setMultiplier] = useState(1);
  const scaledServings = Math.round(recipe.servings * multiplier);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors font-bold text-sm active:scale-95"
      >
        ← Înapoi la rețete
      </button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-6xl">{recipe.icon}</span>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{recipe.name}</h1>
            <p className="text-gray-400 mt-1">{recipe.description}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3">
          {[
            { icon: "⏱️", label: "Preparare", value: recipe.prepLabel },
            { icon: "🔥", label: "Gătire", value: recipe.cookLabel },
            { icon: "⏳", label: "Total", value: recipe.totalLabel },
            { icon: "🍽️", label: "Porții", value: `${scaledServings} ${recipe.servingsUnit}` },
            { icon: "💪", label: "Calorii", value: `${recipe.calories} kcal/porție` },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-lg">{stat.icon}</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
                <p className="text-sm font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
          <div className={`rounded-xl px-4 py-3 border ${
            recipe.difficulty === "Ușor"
              ? "bg-green-900/10 border-green-900/20"
              : recipe.difficulty === "Mediu"
                ? "bg-yellow-900/10 border-yellow-900/20"
                : "bg-red-900/10 border-red-900/20"
          }`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Dificultate</p>
            <p className={`text-sm font-bold ${recipe.difficultyColor}`}>{recipe.difficulty}</p>
          </div>
        </div>
      </div>

      {/* Servings scaler */}
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">Ingrediente</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 font-bold">Porții:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMultiplier(m => Math.max(0.5, m - 0.5))}
                className="w-9 h-9 rounded-lg bg-red-900/20 border border-red-900/30 text-red-400 font-black text-lg hover:bg-red-900/40 transition-all active:scale-90 flex items-center justify-center"
              >
                −
              </button>
              <span className="w-16 text-center text-white font-black text-lg">{scaledServings}</span>
              <button
                onClick={() => setMultiplier(m => Math.min(5, m + 0.5))}
                className="w-9 h-9 rounded-lg bg-red-900/20 border border-red-900/30 text-red-400 font-black text-lg hover:bg-red-900/40 transition-all active:scale-90 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <IngredientList ingredients={recipe.baseIngredients} multiplier={multiplier} />
        {recipe.filling.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <IngredientList ingredients={recipe.filling} multiplier={multiplier} title="Umplutură" />
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6">
        <StepByStep steps={recipe.steps} recipeId={recipe.id} />
      </div>
    </motion.div>
  );
};

// ─── Main Retete Page ───────────────────────────────────────────────────────
export default function RetetePage() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const year = new Date().getFullYear();

  // Recipe Schema for all recipes
  const recipeSchemas = retete.map(r => ({
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": r.name,
    "description": r.description,
    "image": `https://ciocnim.ro${r.image}`,
    "author": { "@type": "Organization", "name": "Ciocnim.ro" },
    "prepTime": r.prepTime,
    "cookTime": r.cookTime,
    "totalTime": r.totalTime,
    "recipeYield": `${r.servings} ${r.servingsUnit}`,
    "recipeCategory": "Rețete de Paște",
    "recipeCuisine": "Românească",
    "nutrition": {
      "@type": "NutritionInformation",
      "calories": `${r.calories} kcal`
    },
    "recipeIngredient": [
      ...r.baseIngredients.map(i => `${i.qty} ${i.unit} ${i.name}`.trim()),
      ...r.filling.map(i => `${i.qty} ${i.unit} ${i.name}`.trim()),
    ],
    "recipeInstructions": r.steps.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "text": step,
    }))
  }));

  return (
    <>
      {recipeSchemas.map((schema, i) => (
        <Script key={i} id={`schema-recipe-${retete[i].id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <main className="min-h-screen bg-[#0c0a0a] text-gray-200">

        {/* Header */}
        <div className="w-full flex justify-between items-center p-6 md:p-8 bg-[#141111] shadow-lg shadow-black/20 border-b border-red-900/20">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl group-hover:scale-110 transition-all">🥚</span>
            <span className="font-bold text-xl md:text-2xl text-white">Ciocnim<span className="text-red-500">.ro</span></span>
          </Link>
          <Link href="/" className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95">
            Înapoi acasă
          </Link>
        </div>

        <div className="w-full max-w-4xl mx-auto pt-8 pb-16 px-6">
          <AnimatePresence mode="wait">
            {selectedRecipe ? (
              <RecipeDetail
                key={selectedRecipe.id}
                recipe={selectedRecipe}
                onBack={() => setSelectedRecipe(null)}
              />
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <header className="text-center space-y-4">
                  <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                    Rețete de <span className="text-red-500">Paște {year}</span>
                  </h1>
                  <p className="text-gray-400 font-bold text-sm md:text-base">
                    Preparatele tradiționale ale mesei festive. Pas cu pas, ușor de urmărit în bucătărie.
                  </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {retete.map((recipe, i) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      index={i}
                      onClick={() => setSelectedRecipe(recipe)}
                    />
                  ))}
                </div>

                <div className="text-center">
                  <Link href="/" className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg">
                    🥚 Ciocnește ouă online
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
