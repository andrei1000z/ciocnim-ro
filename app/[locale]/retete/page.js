"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { safeLS, safeCopy } from "@/app/lib/utils";
import { retete as reteteRo } from "./data";
import { retete as reteteBg } from "./data-bg";
import { retete as reteteEl } from "./data-el";
import LocaleLink from "../../components/LocaleLink";
import { useT } from "../../i18n/useT";
import { useLocaleConfig } from "../../components/DictionaryProvider";
import PageHeader from "../../components/PageHeader";
import ContentNav from "../../components/ContentNav";

// ─── Difficulty mapping per locale ─────────────────────────────────────────
const difficultyMap = {
  ro: { easy: 'Ușor', medium: 'Mediu', advanced: 'Avansat' },
  bg: { easy: 'Лесно', medium: 'Средно', advanced: 'Напреднало' },
  el: { easy: 'Εύκολο', medium: 'Μέτριο', advanced: 'Προχωρημένο' },
};

// ─── Recipe Card (Grid View) ────────────────────────────────────────────────
const RecipeCard = ({ recipe, onClick, index, recipesUI, diff }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    onClick={onClick}
    className="w-full text-left rounded-2xl border border-edge hover:border-red-900/30 transition-all group overflow-hidden shadow-lg shadow-black/20 active:scale-[0.98] relative"
  >
    <div className={`h-1.5 w-full ${
      recipe.difficulty === diff.easy ? "bg-gradient-to-r from-green-600 to-green-400"
        : recipe.difficulty === diff.medium ? "bg-gradient-to-r from-amber-600 to-yellow-400"
        : "bg-gradient-to-r from-red-700 to-red-400"
    }`} />

    <div className="p-5 space-y-3 bg-card">
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 rounded-2xl bg-elevated flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
          {recipe.icon}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
          recipe.difficulty === diff.easy
            ? "bg-green-900/20 text-green-400 border-green-900/30"
            : recipe.difficulty === diff.medium
              ? "bg-yellow-900/20 text-yellow-400 border-yellow-900/30"
              : "bg-red-900/20 text-red-400 border-red-900/30"
        }`}>
          {recipe.difficulty}
        </span>
      </div>

      <div>
        <h2 className="text-lg font-black text-heading group-hover:text-red-400 transition-colors leading-snug">{recipe.name}</h2>
        <p className="text-dim text-sm mt-1 line-clamp-2 leading-relaxed">{recipe.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted">
        <span className="flex items-center gap-1 bg-card px-2.5 py-1 rounded-lg">⏱️ {recipe.totalLabel}</span>
        <span className="flex items-center gap-1 bg-card px-2.5 py-1 rounded-lg">🍽️ {recipe.servings} {recipe.servingsUnit}</span>
        <span className="flex items-center gap-1 bg-card px-2.5 py-1 rounded-lg">🔥 {recipe.calories} kcal</span>
      </div>

      <div className="pt-2 border-t border-edge">
        <span className="text-xs font-bold text-red-400 group-hover:text-red-300 transition-colors flex items-center gap-1">
          {recipesUI.openRecipe} <span className="group-hover:translate-x-1 transition-transform">→</span>
        </span>
      </div>
    </div>
  </motion.button>
);

// ─── Smart unit formatting ──────────────────────────────────────────────────
const formatQuantity = (qty, unit, multiplier) => {
  if (qty === null || qty === undefined) return { display: "", unit: "" };
  const raw = qty * multiplier;

  if (unit === "kg") {
    const grams = raw * 1000;
    if (grams < 1000) return { display: Math.round(grams), unit: "g" };
    if (grams % 1000 === 0) return { display: grams / 1000, unit: "kg" };
    return { display: Math.round(grams), unit: "g" };
  }
  if (unit === "g") {
    const grams = raw;
    if (grams >= 1000 && grams % 100 === 0) return { display: grams / 1000, unit: "kg" };
    return { display: Math.round(grams), unit: "g" };
  }
  if (unit === "l") {
    const ml = raw * 1000;
    if (ml < 1000) return { display: Math.round(ml), unit: "ml" };
    if (ml % 1000 === 0) return { display: ml / 1000, unit: "l" };
    return { display: Math.round(ml), unit: "ml" };
  }
  if (unit === "ml") {
    const ml = raw;
    if (ml >= 1000 && ml % 100 === 0) return { display: ml / 1000, unit: "l" };
    return { display: Math.round(ml), unit: "ml" };
  }

  if (unit === "buc" || unit === "căței" || unit === "ramuri" || unit === "linguri" || unit === "lingură" || unit === "lingurită" || unit === "legătură") {
    const rounded = Math.round(raw * 2) / 2;
    return { display: rounded, unit };
  }

  const val = Math.round(raw * 10) / 10;
  return { display: val, unit };
};

// ─── Render one ingredient line ────────────────────────────────────────────
const formatIngredient = (ing, multiplier) => {
  if (ing.scalable === false && !ing.textFn) {
    return { qtyText: "", nameText: ing.name, isDescriptive: true };
  }
  if (ing.textFn) {
    return { qtyText: "", nameText: ing.textFn(multiplier), isDescriptive: true };
  }
  const fmt = formatQuantity(ing.qty, ing.unit, multiplier);
  if (fmt.display === "") return { qtyText: "", nameText: ing.name, isDescriptive: true };
  return { qtyText: `${fmt.display} ${fmt.unit}`, nameText: ing.name, isDescriptive: false };
};

// ─── Interactive Ingredient List ────────────────────────────────────────────
const IngredientList = ({ ingredients, multiplier, title, healthyMode = false, healthySwaps = [], getSwappedName }) => {
  if (!ingredients || ingredients.length === 0) return null;
  return (
    <div className="space-y-0.5">
      {title && <h4 className="text-sm font-bold uppercase tracking-widest text-red-400 mb-3">{title}</h4>}
      {ingredients.map((ing, i) => {
        const { qtyText, nameText, isDescriptive } = formatIngredient(ing, multiplier);
        const healthySwap = healthyMode
          ? healthySwaps.find(s => nameText.toLowerCase().includes(s.match.toLowerCase()))
          : null;
        const modeSwap = getSwappedName ? getSwappedName(nameText) : null;
        const swap = modeSwap ? { swap: modeSwap } : healthySwap;
        return (
          <div key={i} className={`flex items-baseline gap-2 py-2 border-b border-edge last:border-0 px-2 -mx-2 rounded-lg transition-colors ${swap ? 'bg-green-900/10' : 'hover:bg-card'}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 relative top-[-1px] ${swap ? 'bg-green-500/60' : 'bg-red-500/40'}`} />
            {isDescriptive ? (
              <div className="flex-1">
                <span className={`text-sm md:text-base font-medium ${swap ? 'line-through text-muted' : 'text-body'}`}>{nameText}</span>
                {swap && <span className="block text-sm text-green-300 font-medium mt-0.5">→ {swap.swap}</span>}
              </div>
            ) : (
              <div className="flex-1 flex items-baseline gap-2 flex-wrap">
                <span className={`font-black text-sm tabular-nums whitespace-nowrap ${swap ? 'text-green-400' : 'text-red-400'}`}>{qtyText}</span>
                <div className="flex-1">
                  <span className={`text-sm md:text-base font-medium ${swap ? 'line-through text-muted' : 'text-body'}`}>{nameText}</span>
                  {swap && <span className="block text-sm text-green-300 font-medium mt-0.5">→ {swap.swap}</span>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Step-by-Step with Beautiful Design ─────────────────────────────────────
const StepByStep = ({ steps, recipeId, tips, kitchenMode = false, recipesUI }) => {
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
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
            <h3 className={`font-black text-heading flex items-center gap-2 ${kitchenMode ? "text-3xl md:text-4xl" : "text-lg"}`}>
              {recipesUI.preparationSteps}
            </h3>
            <div className="flex items-center gap-3">
              <span className={`font-bold text-muted ${kitchenMode ? "text-lg" : "text-xs"}`}>{checked.length}/{steps.length} {recipesUI.steps}</span>
              {checked.length > 0 && (
                <button onClick={resetAll} className={`text-muted hover:text-red-400 transition-colors font-bold underline underline-offset-2 ${kitchenMode ? "text-lg" : "text-xs"}`}>
                  {recipesUI.reset}
                </button>
              )}
            </div>
          </div>
      </div>

      <p className="text-xs text-muted font-medium flex items-center gap-1.5 -mt-2">
        <span className="inline-flex w-5 h-5 rounded-full border border-edge-strong items-center justify-center text-[10px] text-muted">1</span>
        {recipesUI.tapToCheck}
      </p>

      <div className="relative">
        <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-edge" />

        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isDone = checked.includes(idx);
            const stepData = typeof step === "string" ? { text: step, tip: null } : step;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => toggle(idx)}
                  className={`w-full text-left flex items-start gap-3 p-3 pl-1 rounded-xl transition-all ${
                    isDone ? "bg-green-900/10" : "hover:bg-card"
                  }`}
                >
                  <span className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${
                    isDone
                      ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/30"
                      : "bg-surface border-edge-strong text-dim"
                  }`}>
                    {isDone ? "✓" : idx + 1}
                  </span>

                  <div className="flex-1 min-w-0 pt-1">
                    <span className={`font-medium leading-relaxed block transition-all ${
                      isDone ? "text-muted line-through decoration-green-600/50" : "text-body"
                    } ${kitchenMode ? "text-xl md:text-2xl" : "text-sm md:text-base"}`}>
                      {stepData.text}
                    </span>

                    {stepData.tip && !isDone && (
                      <span className={`mt-1.5 flex items-start gap-1.5 text-amber-400/70 bg-amber-900/10 px-2.5 py-1.5 rounded-lg border border-amber-900/15 ${kitchenMode ? "text-lg md:text-lg" : "text-xs md:text-sm"}`}>
                        <span className="flex-shrink-0">💡</span>
                        <span>{stepData.tip}</span>
                      </span>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6 bg-gradient-to-br from-green-900/20 to-amber-900/10 border border-green-900/20 rounded-2xl"
        >
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-green-400 font-black text-lg">{recipesUI.recipeDone}</p>
          <p className="text-muted text-sm mt-1">{recipesUI.recipeDoneSubtitle}</p>
        </motion.div>
      )}

      {tips && tips.length > 0 && (
        <div className="bg-amber-900/10 border border-amber-900/15 rounded-2xl p-5 space-y-3">
          <h4 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
            {recipesUI.chefTips}
          </h4>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-300/70 font-medium">
                <span className="text-amber-500/50 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Recipe Detail View ─────────────────────────────────────────────────────
const RecipeDetail = ({ recipe, onBack, recipesUI, locale, diff }) => {
  const [servingsInput, setServingsInput] = useState(String(recipe.servings));
  const [activeVariant, setActiveVariant] = useState(0);
  const [kitchenMode, setKitchenMode] = useState(false);
  const [healthyMode, setHealthyMode] = useState(false);
  const [rapidMode, setRapidMode] = useState(false);
  const [ieftinMode, setIeftinMode] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState("");
  const targetServings = Math.max(1, parseInt(servingsInput) || recipe.servings);
  const multiplier = targetServings / recipe.servings;

  // Get active variant data
  const variant = recipe.variants?.[activeVariant];
  const isDefaultVariant = !variant || activeVariant === 0;
  const currentIngredients = (!isDefaultVariant && variant?.baseIngredients) ? variant.baseIngredients : recipe.baseIngredients;
  const currentFilling = (!isDefaultVariant && variant?.filling) ? variant.filling : recipe.filling;

  // Rapid/Ieftin mode: override steps if available
  const baseSteps = (rapidMode && recipe.rapidMode?.stepsOverride)
    ? recipe.rapidMode.stepsOverride
    : recipe.steps;
  const currentSteps = baseSteps.map((step, idx) => {
    if (!rapidMode && !isDefaultVariant && variant?.stepsOverride?.[idx]) {
      return variant.stepsOverride[idx];
    }
    return step;
  });

  // Apply ingredient swaps for rapidMode or ieftinMode
  const getSwappedName = (nameText) => {
    const swaps = [
      ...(rapidMode && recipe.rapidMode?.swaps ? recipe.rapidMode.swaps : []),
      ...(ieftinMode && recipe.ieftinMode?.swaps ? recipe.ieftinMode.swaps : []),
    ];
    for (const s of swaps) {
      if (nameText.toLowerCase().includes(s.match.toLowerCase())) {
        return s.swap;
      }
    }
    return null;
  };

  const handleCopyIngredients = () => {
    const all = [...currentIngredients, ...(currentFilling || [])];
    const ingredientsList = all
      .map(ing => {
        const { qtyText, nameText } = formatIngredient(ing, multiplier);
        return qtyText ? `• ${qtyText} ${nameText}` : `• ${nameText}`;
      })
      .join("\n");

    const text = `*${recipesUI.ingredients} — ${targetServings} ${recipe.servingsUnit} — ${recipe.name}*\n\n${ingredientsList}`;
    safeCopy(text);
    setCopiedFeedback(recipesUI.copied);
    setTimeout(() => setCopiedFeedback(""), 2000);
  };

  const handleShareRecipe = () => {
    const url = `https://ciocnim.ro/${locale}/retete?r=${recipe.id}`;
    const text = `${recipe.name}\n${recipe.description}\n${url}`;
    if (navigator.share) {
      navigator.share({
        title: recipe.name,
        text: recipe.description,
        url,
      }).catch(() => {
        safeCopy(text);
        setCopiedFeedback(recipesUI.copied);
        setTimeout(() => setCopiedFeedback(""), 2000);
      });
    } else {
      safeCopy(text);
      setCopiedFeedback(recipesUI.copied);
      setTimeout(() => setCopiedFeedback(""), 2000);
    }
  };

  const handleServingsChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setServingsInput(val);
  };

  const adjustServings = (delta) => {
    const current = parseInt(servingsInput) || recipe.servings;
    const next = Math.max(1, current + delta);
    setServingsInput(String(next));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={`space-y-6 rounded-2xl transition-colors duration-300 ${kitchenMode ? "bg-surface-hover p-4 md:p-6" : ""}`}
    >
      {/* Back button and Share button */}
      <div className="flex gap-3 items-center flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-dim hover:text-red-400 transition-colors font-bold text-sm active:scale-95"
        >
          {recipesUI.backToRecipes}
        </button>
        <button
          onClick={handleShareRecipe}
          className="flex items-center gap-2 text-dim hover:text-amber-400 transition-colors font-bold text-sm active:scale-95"
        >
          {recipesUI.shareRecipe}
        </button>
      </div>

      {/* Header with Kitchen Mode Toggle */}
      <div className="flex justify-between items-start gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900/20 via-card to-amber-900/10 border border-edge p-5 md:p-8 flex-1">
          <div className="absolute top-3 right-3 text-6xl md:text-7xl opacity-15 select-none">{recipe.icon}</div>
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-elevated-hover flex items-center justify-center text-3xl md:text-5xl">
                {recipe.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                recipe.difficulty === diff.easy
                  ? "bg-green-900/20 text-green-400 border-green-900/30"
                  : recipe.difficulty === diff.medium
                    ? "bg-yellow-900/20 text-yellow-400 border-yellow-900/30"
                    : "bg-red-900/20 text-red-400 border-red-900/30"
              }`}>
                {recipe.difficulty}
              </span>
            </div>
            <h1 className="text-xl md:text-4xl font-black text-heading leading-tight">{recipe.name}</h1>
            <p className="text-dim mt-1.5 leading-relaxed text-sm">{recipe.description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => setKitchenMode(!kitchenMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border whitespace-nowrap ${
              kitchenMode
                ? "bg-amber-900/30 text-amber-400 border-amber-700/40 shadow-lg shadow-amber-900/20"
                : "bg-elevated text-dim border-edge-strong hover:bg-elevated-hover hover:text-body"
            }`}
          >
            {kitchenMode ? "👨‍🍳" : "👁️"} {recipesUI.kitchenMode}
          </button>
          <button
            onClick={() => setHealthyMode(m => !m)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border whitespace-nowrap ${
              healthyMode
                ? "bg-green-900/25 text-green-300 border-green-700/40 shadow-lg shadow-green-900/15"
                : "bg-card text-dim border-edge hover:border-green-700/30 hover:text-green-400"
            }`}
          >
            🥗 {healthyMode ? recipesUI.healthyOn : recipesUI.healthyMode}
          </button>
          {recipe.rapidMode && (
            <button
              onClick={() => setRapidMode(m => !m)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border whitespace-nowrap ${
                rapidMode
                  ? "bg-blue-900/25 text-blue-300 border-blue-700/40 shadow-lg shadow-blue-900/15"
                  : "bg-card text-dim border-edge hover:border-blue-700/30 hover:text-blue-400"
              }`}
            >
              ⚡ {rapidMode ? recipesUI.rapidOn : recipesUI.rapidMode}
            </button>
          )}
          {recipe.ieftinMode && (
            <button
              onClick={() => setIeftinMode(m => !m)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border whitespace-nowrap ${
                ieftinMode
                  ? "bg-amber-900/25 text-amber-300 border-amber-700/40 shadow-lg shadow-amber-900/15"
                  : "bg-card text-dim border-edge hover:border-amber-700/30 hover:text-amber-400"
              }`}
            >
              💰 {ieftinMode ? recipesUI.cheapOn : recipesUI.cheapMode}
            </button>
          )}
        </div>
      </div>

      {healthyMode && recipe.healthySwaps && recipe.healthySwaps.length > 0 && (
        <div className="rounded-xl bg-green-900/15 border border-green-700/25 px-4 py-3 flex items-start gap-2.5">
          <span className="text-lg flex-shrink-0">🥗</span>
          <div>
            <p className="text-sm font-bold text-green-300 mb-1">{recipesUI.healthyActive}</p>
            <p className="text-xs text-green-400/70 leading-relaxed">{recipe.healthyNote}</p>
          </div>
        </div>
      )}
      {healthyMode && recipe.healthySwaps && recipe.healthySwaps.length === 0 && (
        <div className="rounded-xl bg-green-900/15 border border-green-700/25 px-4 py-3 flex items-start gap-2.5">
          <span className="text-lg flex-shrink-0">✅</span>
          <p className="text-xs text-green-400/70 leading-relaxed">{recipe.healthyNote}</p>
        </div>
      )}
      {rapidMode && recipe.rapidMode && (
        <div className="rounded-xl bg-blue-900/15 border border-blue-700/25 px-4 py-3 flex items-start gap-2.5">
          <span className="text-lg flex-shrink-0">⚡</span>
          <div>
            <p className="text-sm font-bold text-blue-300 mb-1">{recipesUI.rapidActive} — {recipe.rapidMode.totalLabel}</p>
            <p className="text-xs text-blue-400/70 leading-relaxed">{recipe.rapidMode.note}</p>
          </div>
        </div>
      )}
      {ieftinMode && recipe.ieftinMode && (
        <div className="rounded-xl bg-amber-900/15 border border-amber-700/25 px-4 py-3 flex items-start gap-2.5">
          <span className="text-lg flex-shrink-0">💰</span>
          <div>
            <p className="text-sm font-bold text-amber-300 mb-1">{recipesUI.cheapActive}</p>
            <p className="text-xs text-amber-400/70 leading-relaxed">{recipe.ieftinMode.note}</p>
          </div>
        </div>
      )}

      {/* Variant selector */}
      {recipe.variants && recipe.variants.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {recipe.variants.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setActiveVariant(i)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 border ${
                activeVariant === i
                  ? "bg-red-700 text-white border-red-700 shadow-lg shadow-red-900/30"
                  : "bg-card text-dim border-edge hover:border-red-900/30 hover:text-body"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {[
          { icon: "⏱️", label: recipesUI.prep, value: recipe.prepLabel },
          { icon: "🔥", label: recipesUI.cook, value: recipe.cookLabel },
          { icon: "⏳", label: recipesUI.total, value: recipe.totalLabel },
          { icon: "🍽️", label: recipesUI.servings, value: `${targetServings} ${recipe.servingsUnit}` },
          { icon: "💪", label: recipesUI.calories, value: `${Math.round((healthyMode && recipe.healthyCalories ? recipe.healthyCalories : recipe.calories) * multiplier)} kcal${healthyMode && recipe.healthyCalories && recipe.healthyCalories < recipe.calories ? ' 🥗' : ''}` },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-edge rounded-xl px-3 py-2.5 text-center flex-shrink-0 min-w-[80px]">
            <span className="text-base block">{stat.icon}</span>
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted mt-0.5">{stat.label}</p>
            <p className="text-xs font-bold text-heading whitespace-nowrap">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Ingredients section */}
      <div className="bg-card border border-edge rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-black text-heading flex items-center gap-2 mb-2">
              {recipesUI.ingredients}
            </h3>
            <button
              onClick={handleCopyIngredients}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 ${
                copiedFeedback === recipesUI.copied
                  ? "bg-green-900/30 text-green-400 border border-green-700/40"
                  : "bg-red-900/20 text-red-400 border border-red-900/30 hover:bg-red-900/30"
              }`}
            >
              {copiedFeedback || recipesUI.copyList}
            </button>
          </div>
          <div className="flex items-center gap-1 bg-card rounded-xl p-1 border border-edge flex-shrink-0">
            <button
              onClick={() => adjustServings(-1)}
              disabled={targetServings <= 1}
              className="w-8 h-8 rounded-lg bg-red-900/20 border border-red-900/30 text-red-400 font-black text-base hover:bg-red-900/40 transition-all active:scale-90 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            >
              −
            </button>
            <div className="flex items-center gap-0.5 px-0.5">
              <input
                type="text"
                inputMode="numeric"
                value={servingsInput}
                onChange={handleServingsChange}
                className="w-10 text-center font-black text-base outline-none border-none servings-input"
                style={{ background: 'transparent' }}
                maxLength={3}
              />
              <span className="text-[10px] text-muted font-bold whitespace-nowrap">{recipe.servingsUnit}</span>
            </div>
            <button
              onClick={() => adjustServings(1)}
              className="w-8 h-8 rounded-lg bg-red-900/20 border border-red-900/30 text-red-400 font-black text-base hover:bg-red-900/40 transition-all active:scale-90 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {multiplier !== 1 && (
          <p className="text-xs text-amber-400/60 font-bold mb-4 flex items-center gap-1.5">
            <span>📐</span> {recipesUI.adjustedFor?.replace('{servings}', targetServings).replace('{unit}', recipe.servingsUnit).replace('{multiplier}', multiplier % 1 === 0 ? multiplier : multiplier.toFixed(2)) || `${targetServings} ${recipe.servingsUnit} (×${multiplier % 1 === 0 ? multiplier : multiplier.toFixed(2)})`}
          </p>
        )}

        <IngredientList ingredients={currentIngredients} multiplier={multiplier} healthyMode={healthyMode} healthySwaps={recipe.healthySwaps || []} getSwappedName={getSwappedName} />
        {currentFilling && currentFilling.length > 0 && (
          <div className="mt-6 pt-6 border-t border-edge">
            <IngredientList ingredients={currentFilling} multiplier={multiplier} title={recipesUI.filling} healthyMode={healthyMode} healthySwaps={recipe.healthySwaps || []} getSwappedName={getSwappedName} />
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="bg-card border border-edge rounded-2xl p-4 md:p-6">
        <StepByStep steps={currentSteps} recipeId={`${recipe.id}-${recipe.variants?.[activeVariant]?.id || 'default'}`} tips={recipe.tips} kitchenMode={kitchenMode} recipesUI={recipesUI} />
      </div>
    </motion.div>
  );
};

// ─── Main Retete Page ───────────────────────────────────────────────────────
function RetePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const { locale } = useLocaleConfig();
  const recipesUI = t('content.recipes');

  const retete = locale === 'bg' ? reteteBg : locale === 'el' ? reteteEl : reteteRo;
  const diff = difficultyMap[locale] || difficultyMap.ro;

  const selectedId = searchParams.get("r");
  const selectedRecipe = retete.find(r => r.id === selectedId) || null;

  const [filterDiff, setFilterDiff] = useState("toate");
  const [search, setSearch] = useState("");

  const year = new Date().getFullYear();

  const filteredRetete = retete.filter(r => {
    const matchDiff = filterDiff === "toate"
      || r.difficulty === filterDiff
      || (filterDiff === diff.easy && r.difficulty === diff.easy)
      || (filterDiff === diff.medium && r.difficulty === diff.medium)
      || (filterDiff === diff.advanced && r.difficulty === diff.advanced);
    const matchSearch = search === "" || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchDiff && matchSearch;
  });

  return (
      <main className="min-h-screen bg-main text-body">

        <PageHeader />
        <ContentNav current="/retete" />

        <div className="w-full max-w-5xl mx-auto pt-8 pb-16 px-6">
          <AnimatePresence mode="wait">
            {selectedRecipe ? (
              <RecipeDetail
                key={selectedRecipe.id}
                recipe={selectedRecipe}
                onBack={() => {
                  router.push(`/${locale}/retete`, { scroll: false });
                  window.scrollTo(0, 0);
                }}
                recipesUI={recipesUI}
                locale={locale}
                diff={diff}
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
                  <h1 className="text-4xl md:text-6xl font-black text-heading leading-tight">
                    {recipesUI.pageTitle?.replace('{year}', year)}
                  </h1>
                  <p className="text-dim font-bold text-sm md:text-base max-w-lg mx-auto">
                    {recipesUI.pageSubtitle?.replace('{count}', retete.length)}
                  </p>
                </header>

                {/* Search input */}
                <div className="max-w-md mx-auto w-full">
                  <input
                    type="text"
                    placeholder={recipesUI.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-edge-strong bg-card text-heading placeholder-muted focus:outline-none focus:border-red-500/50 focus:bg-elevated-hover transition-all text-sm"
                  />
                </div>

                {/* Difficulty filters */}
                <div className="flex gap-2 justify-center flex-wrap">
                  {[
                    { key: "toate", label: recipesUI.allFilter },
                    { key: diff.easy, label: recipesUI.easyDiff },
                    { key: diff.medium, label: recipesUI.mediumDiff },
                    { key: diff.advanced, label: recipesUI.advancedDiff },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setFilterDiff(item.key)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 border ${
                        filterDiff === item.key
                          ? "bg-red-700 text-white border-red-700 shadow-lg shadow-red-900/30"
                          : "bg-card text-dim border-edge hover:border-red-900/30 hover:text-body"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRetete.length > 0 ? (
                    filteredRetete.map((recipe, i) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        index={i}
                        recipesUI={recipesUI}
                        diff={diff}
                        onClick={() => {
                          router.push(`/${locale}/retete?r=${recipe.id}`, { scroll: false });
                          window.scrollTo(0, 0);
                        }}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full text-center py-12"
                    >
                      <p className="text-dim font-bold text-lg">{recipesUI.noResults}</p>
                    </motion.div>
                  )}
                </div>

                <div className="text-center">
                  <LocaleLink href="/" className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg">
                    {recipesUI.ctaOnline}
                  </LocaleLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
  );
}

export default function RetetePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-main" />}>
      <RetePageContent />
    </Suspense>
  );
}
