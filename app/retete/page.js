"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Script from "next/script";

// ─── Safe localStorage ──────────────────────────────────────────────────────
const safeLS = {
  get: (key) => { try { return typeof window !== "undefined" ? localStorage.getItem(key) : null; } catch { return null; } },
  set: (key, val) => { try { if (typeof window !== "undefined") localStorage.setItem(key, val); } catch {} },
};

// ─── Recipe Data ────────────────────────────────────────────────────────────
// `scalable: false` → ingredient text stays the same regardless of portion
// `textFn: (mult) => string` → custom text per multiplier for descriptive items
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
    tips: [
      "Toate ingredientele trebuie să fie la temperatura camerei.",
      "Frământă aluatul minim 15 minute — cu cât frământi mai mult, cu atât e mai pufos.",
      "Nu deschide cuptorul în primele 30 de minute de coacere.",
      "Testează cu o scobitoare — dacă iese curată, cozonacul e gata.",
    ],
    baseIngredients: [
      { qty: 1, unit: "kg", name: "făină albă tip 000" },
      { qty: 10, unit: "buc", name: "gălbenușuri de ou" },
      { qty: 250, unit: "g", name: "zahăr" },
      { qty: 200, unit: "ml", name: "lapte călduț" },
      { qty: 150, unit: "g", name: "unt moale" },
      { qty: 50, unit: "g", name: "drojdie proaspătă" },
      { qty: 1, unit: "buc", name: "coajă rasă de lămâie", textFn: (m) => m < 1 ? "coajă rasă de la jumătate de lămâie" : m === 1 ? "coajă rasă de lămâie" : `coajă rasă de la ${m} lămâi` },
      { qty: 1, unit: "lingurită", name: "esență de vanilie", textFn: (m) => m <= 0.5 ? "½ lingurită esență de vanilie" : m === 1 ? "1 lingurită esență de vanilie" : `${Math.round(m)} lingurițe esență de vanilie` },
      { qty: null, unit: "", name: "sare (un praf)", scalable: false },
    ],
    filling: [
      { qty: 300, unit: "g", name: "nucă măcinată" },
      { qty: 100, unit: "g", name: "zahăr" },
      { qty: 50, unit: "g", name: "cacao" },
      { qty: 3, unit: "linguri", name: "rom alimentar" },
    ],
    steps: [
      { text: "Dizolvă drojdia în laptele călduț cu o linguriță de zahăr. Lasă 10 minute până face spumă.", tip: "Laptele trebuie să fie călduț, nu fierbinte — drojdia moare la peste 40°C." },
      { text: "Amestecă făina cu zahărul și sarea. Adaugă gălbenușurile pe rând, drojdia dizolvată și frământă 15-20 minute.", tip: null },
      { text: "Încorporează untul moale bucată cu bucată, continuă să frământi până aluatul devine elastic și se desprinde de mâini.", tip: "Untul trebuie să fie la temperatura camerei, nu topit." },
      { text: "Adaugă coaja de lămâie și vanilia. Acoperă cu un prosop și lasă la dospit 1-2 ore (până se dublează).", tip: "Pune bolul într-un loc cald, fără curenți." },
      { text: "Prepară umplutura: amestecă nuca cu zahărul, cacaua și romul.", tip: null },
      { text: "Întinde aluatul în dreptunghi, presară umplutura uniform, apoi rulează strâns.", tip: "Nu presăra umplutura până la margini — lasă 2cm liberi." },
      { text: "Așează ruloul în tavă unsă cu unt și tapetată cu făină. Lasă la dospit încă 30-40 minute.", tip: null },
      { text: "Unge cu gălbenuș bătut cu puțin lapte. Coace la 170°C pentru 45-50 minute.", tip: "Pune tava pe raftul de jos al cuptorului." },
      { text: "Scoate din cuptor, lasă 10 minute în tavă, apoi răstoarnă pe un grătar. Acoperă cu un prosop curat.", tip: null },
    ],
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
    tips: [
      "Organele se pot trece prin mașina de tocat pentru textură mai fină.",
      "Drobul e mai gustos a doua zi, servit rece.",
      "Poți adăuga și măduvă de miel pentru un plus de savoare.",
    ],
    baseIngredients: [
      { qty: 500, unit: "g", name: "organe de miel (ficat, inimă, plămâni, rinichi)" },
      { qty: 4, unit: "buc", name: "ouă" },
      { qty: 2, unit: "buc", name: "cepe mari" },
      { qty: 1, unit: "legătură", name: "mărar proaspăt" },
      { qty: 1, unit: "legătură", name: "pătrunjel proaspăt" },
      { qty: 1, unit: "legătură", name: "lob (leuștean)" },
      { qty: 3, unit: "linguri", name: "ulei de măsline" },
      { qty: null, unit: "", name: "sare și piper după gust", scalable: false },
      { qty: 100, unit: "ml", name: "lapte" },
      { qty: 2, unit: "linguri", name: "pesmet" },
    ],
    filling: [],
    steps: [
      { text: "Spală bine organele de miel și fierbe-le în apă cu sare 20-25 de minute. Scurge și lasă să se răcească.", tip: "Schimbă apa o dată în timpul fierberii pentru un gust mai curat." },
      { text: "Taie organele în cubulețe mici sau trece-le prin mașina de tocat (textură mai fină).", tip: null },
      { text: "Călește ceapa tăiată mărunt în ulei până devine translucidă.", tip: null },
      { text: "Amestecă organele tocate cu ceapa călită, verdețurile tăiate fin, ouăle bătute, laptele, sarea și piperul.", tip: null },
      { text: "Unge o tavă de cozonac cu ulei și presară pesmet pe fund și pereți.", tip: null },
      { text: "Toarnă compoziția în tavă. Decorează deasupra cu felii de ou fiert și frunze de verdeață.", tip: "Ouăle fierte tăiate în rondele arată spectaculos la tăiere." },
      { text: "Coace la 180°C pentru 45-50 minute, până devine auriu deasupra.", tip: null },
      { text: "Lasă să se răcească complet în tavă înainte de a tăia felii. Se servește rece sau la temperatura camerei.", tip: null },
    ],
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
    tips: [
      "Brânza de vaci trebuie scursă foarte bine — pune-o într-un tifon și lasă 2-3 ore.",
      "Stafidele se înmoaie în rom sau apă caldă 15 minute înainte.",
      "Nu deschide cuptorul devreme — pașca se lasă la mijloc.",
    ],
    baseIngredients: [
      { qty: 500, unit: "g", name: "brânză dulce de vaci (scursă bine)" },
      { qty: 4, unit: "buc", name: "ouă" },
      { qty: 150, unit: "g", name: "zahăr" },
      { qty: 100, unit: "g", name: "stafide" },
      { qty: 100, unit: "g", name: "smântână" },
      { qty: 1, unit: "lingurită", name: "esență de vanilie", textFn: (m) => m <= 0.5 ? "½ lingurită esență de vanilie" : m === 1 ? "1 lingurită esență de vanilie" : `${Math.round(m)} lingurițe esență de vanilie` },
      { qty: 1, unit: "buc", name: "coajă rasă de lămâie", textFn: (m) => m < 1 ? "coajă rasă de la jumătate de lămâie" : m === 1 ? "coajă rasă de lămâie" : `coajă rasă de la ${m} lămâi` },
      { qty: 50, unit: "g", name: "griș" },
    ],
    filling: [],
    steps: [
      { text: "Pregătește aluatul de cozonac (sau folosește aluat gata de pască). Tapetează o formă rotundă cu aluat pe fund și margini.", tip: null },
      { text: "Mixează brânza de vaci cu zahărul până devine cremoasă.", tip: "Folosește un mixer pentru o textură cât mai fină." },
      { text: "Adaugă ouăle pe rând, mestecând după fiecare. Apoi smântâna, vanilia și coaja de lămâie.", tip: null },
      { text: "Încorporează grișul și stafidele (înmuiate 10 minute în apă caldă și scurse).", tip: null },
      { text: "Toarnă compoziția de brânză peste aluatul din formă.", tip: null },
      { text: "Decorează deasupra cu benzi de aluat în formă de cruce sau grilaj.", tip: "Aluatul de decor se subțiază și se aranjează frumos." },
      { text: "Unge cu gălbenuș bătut. Coace la 170°C pentru 40-45 minute, până devine aurie.", tip: null },
      { text: "Lasă să se răcească complet în formă. Se servește rece, presărată cu zahăr pudră.", tip: null },
    ],
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
    tips: [
      "Scoate carnea din frigider cu 30 min înainte — se gătește mai uniform.",
      "Unge carnea cu sucul din tavă la fiecare 30 de minute.",
      "Lasă carnea să se odihnească 15 min sub folie înainte de tăiere.",
    ],
    baseIngredients: [
      { qty: 1.5, unit: "kg", name: "pulpă sau spată de miel" },
      { qty: 8, unit: "căței", name: "usturoi" },
      { qty: 3, unit: "ramuri", name: "rozmarin proaspăt" },
      { qty: 3, unit: "linguri", name: "ulei de măsline" },
      { qty: null, unit: "", name: "sare și piper după gust", scalable: false },
      { qty: 2, unit: "buc", name: "cepe mari (tăiate în sferturi)" },
      { qty: 500, unit: "g", name: "cartofi (tăiați în sferturi)" },
      { qty: 200, unit: "ml", name: "vin alb sec" },
      { qty: 1, unit: "buc", name: "suc de lămâie", textFn: (m) => m < 1 ? "suc de la jumătate de lămâie" : m === 1 ? "suc de la o lămâie" : `suc de la ${m} lămâi` },
    ],
    filling: [],
    steps: [
      { text: "Scoate carnea de miel la temperatura camerei cu 30 minute înainte de gătit.", tip: null },
      { text: "Fă tăieturi adânci în carne și introduce felii de usturoi și frunze de rozmarin în fiecare tăietură.", tip: "Fă tăieturile la 3-4 cm distanță una de alta." },
      { text: "Freacă carnea cu ulei de măsline, sare, piper și suc de lămâie.", tip: null },
      { text: "Așează ceapa și cartofii pe fundul tăvii. Pune carnea deasupra.", tip: null },
      { text: "Toarnă vinul în tavă. Acoperă strâns cu folie de aluminiu.", tip: null },
      { text: "Coace la 180°C acoperit timp de 1.5 ore. Apoi scoate folia și crește temperatura la 200°C.", tip: "Tava trebuie acoperită etanș — aburi = carne fragedă." },
      { text: "Coace neacoperit încă 30 minute, ungând ocazional cu sucul din tavă, până se rumenește frumos.", tip: null },
      { text: "Lasă carnea să se odihnească 15 minute acoperită cu folie înainte de a tăia. Servește cu legumele din tavă.", tip: null },
    ],
  },
  {
    id: "salata-boeuf",
    name: "Salată de Boeuf",
    icon: "🥗",
    description: "Salata de boeuf este nelipsită de pe masa de Paște. Rețeta tradițională cu piept de pui, legume fierte și maioneză de casă.",
    prepTime: "PT45M",
    prepLabel: "45 min",
    cookTime: "PT40M",
    cookLabel: "40 min",
    totalTime: "PT2H",
    totalLabel: "~2h",
    servings: 10,
    servingsUnit: "porții",
    calories: 240,
    difficulty: "Mediu",
    difficultyColor: "text-yellow-400",
    tips: [
      "Fierbe legumele separat — fiecare are alt timp de gătire.",
      "Taie totul în cubulețe mici și egale — textura contează.",
      "Adaugă maioneza treptat — nu pune toată odată.",
      "Lasă salata la rece minim 2 ore înainte de servire.",
    ],
    baseIngredients: [
      { qty: 500, unit: "g", name: "piept de pui (sau vită)" },
      { qty: 500, unit: "g", name: "cartofi" },
      { qty: 300, unit: "g", name: "morcovi" },
      { qty: 200, unit: "g", name: "rădăcină de pătrunjel" },
      { qty: 200, unit: "g", name: "mazăre (conservă sau congelată)" },
      { qty: 200, unit: "g", name: "murături asortate (castraveți, gogoșari)" },
      { qty: 4, unit: "buc", name: "ouă fierte" },
      { qty: 300, unit: "g", name: "maioneză" },
      { qty: 2, unit: "linguri", name: "muștar" },
      { qty: null, unit: "", name: "sare și piper după gust", scalable: false },
    ],
    filling: [],
    steps: [
      { text: "Fierbe pieptul de pui în apă cu sare, un morcov și o frunză de dafin, 30-35 minute. Lasă să se răcească.", tip: null },
      { text: "Fierbe cartofii și morcovii separat, în coajă, până sunt al dente (nu prea moi). Răcește în apă rece.", tip: "Cartofii trecuți de fiert se sfărâmă — verifică cu o scobitoare." },
      { text: "Fierbe ouăle tari (10 minute), răcește-le în apă rece, curăță-le.", tip: null },
      { text: "Taie carnea, cartofii, morcovii, ouăle și murăturile în cubulețe mici (5mm).", tip: "Asta e etapa care durează cel mai mult — pune muzică bună." },
      { text: "Adaugă mazărea scursă și rădăcina de pătrunjel tăiată mărunt.", tip: null },
      { text: "Amestecă maioneza cu muștarul. Încorporează treptat în salată, amestecând delicat.", tip: "Nu pune toată maioneza — păstrează puțin pentru decorare." },
      { text: "Potrivește de sare și piper. Egalează într-un bol sau formă.", tip: null },
      { text: "Decorează cu maioneză, felii de ou, măsline și verdețuri. Refrigerează minim 2 ore.", tip: null },
    ],
  },
  {
    id: "oua-rosii",
    name: "Ouă Roșii Vopsite Natural",
    icon: "🥚",
    description: "Rețeta tradițională de vopsit ouă cu coji de ceapă — culoare intensă, 100% naturală, fără chimicale.",
    prepTime: "PT15M",
    prepLabel: "15 min",
    cookTime: "PT30M",
    cookLabel: "30 min",
    totalTime: "PT1H",
    totalLabel: "~1h",
    servings: 10,
    servingsUnit: "ouă",
    calories: 70,
    difficulty: "Ușor",
    difficultyColor: "text-green-400",
    tips: [
      "Cu cât lași mai multe coji, cu atât roșul e mai intens.",
      "Ouăle trebuie scoase din frigider cu 2 ore înainte — altfel crapă.",
      "Adaugă o lingură de oțet — fixează culoarea.",
      "Pentru luciu, freacă ouăle cu puțin ulei după ce se usucă.",
    ],
    baseIngredients: [
      { qty: 10, unit: "buc", name: "ouă (la temperatura camerei)" },
      { qty: null, unit: "", name: "coji de la 8-10 cepe galbene", scalable: false, textFn: (m) => m <= 0.5 ? "coji de la 4-5 cepe galbene" : m === 1 ? "coji de la 8-10 cepe galbene" : `coji de la ${Math.round(8 * m)}-${Math.round(10 * m)} cepe galbene` },
      { qty: 2, unit: "linguri", name: "oțet alb" },
      { qty: 1, unit: "lingură", name: "ulei (pentru luciu la final)" },
      { qty: null, unit: "", name: "sare (o linguriță)", scalable: false },
      { qty: null, unit: "", name: "apă cât să acopere ouăle", scalable: false },
    ],
    filling: [],
    steps: [
      { text: "Adună coji de ceapă galbenă — cu cât mai multe, cu atât culoarea e mai intensă. Pune-le într-o oală mare.", tip: "Poți aduna coji cu câteva zile înainte." },
      { text: "Adaugă apă peste coji cât să le acopere bine. Fierbe 20-30 minute pentru a obține un lichid roșu-brun intens.", tip: null },
      { text: "Strecoară lichidul și pune-l înapoi în oală. Adaugă oțetul și sarea.", tip: null },
      { text: "Pune ouăle (la temperatura camerei!) delicat în lichid. Lichidul trebuie să le acopere.", tip: "Ouăle reci crapă la contact cu lichidul fierbinte." },
      { text: "Fierbe la foc mic 10-12 minute. Pentru culoare mai intensă, lasă ouăle în lichid după stingerea focului.", tip: null },
      { text: "Scoate ouăle cu o lingură și lasă-le pe un grătar sau pe hârtie de bucătărie.", tip: null },
      { text: "După ce s-au răcit complet, freacă fiecare ou cu puțin ulei pe un șervețel — le dă un luciu superb.", tip: null },
    ],
  },
  {
    id: "ciorba-miel",
    name: "Ciorbă de Miel cu Leuștean",
    icon: "🥣",
    description: "Ciorbă tradițională de Paște, acrișoară și aromată, cu carne fragedă de miel și leuștean proaspăt.",
    prepTime: "PT20M",
    prepLabel: "20 min",
    cookTime: "PT1H30M",
    cookLabel: "1.5h",
    totalTime: "PT2H",
    totalLabel: "~2h",
    servings: 8,
    servingsUnit: "porții",
    calories: 210,
    difficulty: "Ușor",
    difficultyColor: "text-green-400",
    tips: [
      "Spuma care se formează la fierbere trebuie luată — dă un gust neplăcut.",
      "Borșul se adaugă doar la final și nu se mai fierbe mult după.",
      "Leușteanul se pune doar la servire, proaspăt.",
    ],
    baseIngredients: [
      { qty: 500, unit: "g", name: "carne de miel cu os" },
      { qty: 2, unit: "buc", name: "cepe" },
      { qty: 2, unit: "buc", name: "morcovi" },
      { qty: 1, unit: "buc", name: "păstârnac" },
      { qty: 1, unit: "buc", name: "țelină mică" },
      { qty: 2, unit: "buc", name: "roșii" },
      { qty: 200, unit: "ml", name: "borș acru" },
      { qty: 1, unit: "legătură", name: "leuștean proaspăt" },
      { qty: 2, unit: "buc", name: "ouă (pentru dresire)" },
      { qty: 100, unit: "ml", name: "smântână (pentru dresire)" },
      { qty: null, unit: "", name: "sare și piper după gust", scalable: false },
    ],
    filling: [],
    steps: [
      { text: "Pune carnea de miel într-o oală cu 3 litri de apă rece. Pune pe foc.", tip: null },
      { text: "Când începe să fiarbă, ia spuma care se formează la suprafață. Repetă de câte ori e nevoie.", tip: "Asta e cheia unei ciorbe limpezi." },
      { text: "Adaugă ceapa tăiată mărunt, morcovii, păstârnacul și țelina tăiate cubulețe. Fierbe la foc mic 1 oră.", tip: null },
      { text: "Adaugă roșiile tăiate (sau 2 linguri bulion). Fierbe încă 20 minute.", tip: null },
      { text: "Încălzește borșul separat (nu-l fierbe). Adaugă-l în ciorbă și amestecă.", tip: "Borșul fiert devine amar." },
      { text: "Bate ouăle cu smântâna. Temperează cu câteva linguri de supă caldă, apoi toarnă în oală amestecând continuu.", tip: "Temperarea previne tăierea ouălor." },
      { text: "Potrivește de sare și piper. Servește cu leuștean proaspăt tăiat fin.", tip: null },
    ],
  },
  {
    id: "sarmale",
    name: "Sarmale în Foi de Varză",
    icon: "🫔",
    description: "Sarmalele — mândria bucătăriei românești. Rulouri de carne tocată în foi de varză murată, gătite lent la cuptor.",
    prepTime: "PT45M",
    prepLabel: "45 min",
    cookTime: "PT3H",
    cookLabel: "3h",
    totalTime: "PT4H",
    totalLabel: "~4h",
    servings: 30,
    servingsUnit: "sarmale",
    calories: 180,
    difficulty: "Avansat",
    difficultyColor: "text-red-400",
    tips: [
      "Sarmalele sunt și mai bune a doua zi, reîncălzite.",
      "Foile de varză prea sărate se spală în apă caldă.",
      "Aranjează-le strâns în oală — nu le lăsa să se desfacă.",
      "Gătirea lentă la cuptor e secretul sarmalelor perfecte.",
    ],
    baseIngredients: [
      { qty: 1, unit: "buc", name: "varză murată mare (sau foi de varză)" },
      { qty: 1, unit: "kg", name: "carne tocată de porc" },
      { qty: 300, unit: "g", name: "ceapă (tocată mărunt)" },
      { qty: 100, unit: "g", name: "orez (spălat)" },
      { qty: 200, unit: "g", name: "afumătură (costiță, kaiser)" },
      { qty: 500, unit: "ml", name: "bulion de roșii (sau suc de roșii)" },
      { qty: 2, unit: "linguri", name: "boia dulce" },
      { qty: 1, unit: "lingurită", name: "cimbru uscat", textFn: (m) => m <= 0.5 ? "½ lingurită cimbru uscat" : m === 1 ? "1 lingurită cimbru uscat" : `${Math.round(m)} lingurițe cimbru uscat` },
      { qty: null, unit: "", name: "sare și piper după gust", scalable: false },
      { qty: 3, unit: "buc", name: "foi de dafin" },
    ],
    filling: [],
    steps: [
      { text: "Desfă frunzele de varză murată. Taie nervura groasă de pe fiecare frunză pentru a le face flexibile.", tip: null },
      { text: "Amestecă carnea tocată cu ceapa, orezul spălat, boiaua, cimbrul, sare și piper.", tip: "Orezul se pune crud — se gătește în sarma." },
      { text: "Pune o lingură de compoziție pe fiecare frunză și rulează strâns, îndoind capetele.", tip: "Sarmalele mici sunt mai gustoase decât cele mari." },
      { text: "Într-o oală mare (sau un vas de cuptor), pune un strat de varză tăiată fâșii pe fund.", tip: null },
      { text: "Aranjează sarmalele strâns, în straturi. Presară felii de afumătură și foi de dafin între straturi.", tip: null },
      { text: "Toarnă bulionul de roșii amestecat cu apă (cât să acopere sarmalele).", tip: null },
      { text: "Acoperă cu un strat de varză tăiată. Pune capac sau folie de aluminiu.", tip: null },
      { text: "Gătește la 180°C în cuptor pentru 2.5-3 ore, sau pe foc mic pe aragaz. Verifică lichidul ocazional.", tip: "Nu amesteca — doar scutură ușor oala." },
      { text: "Servește cu smântână și mămăligă caldă. Cele mai bune sunt după ce se reîncălzesc a doua zi.", tip: null },
    ],
  },
];

// ─── Recipe Card (Grid View) ────────────────────────────────────────────────
const RecipeCard = ({ recipe, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    onClick={onClick}
    className="w-full text-left rounded-2xl border border-white/[0.06] hover:border-red-900/30 transition-all group overflow-hidden shadow-lg shadow-black/20 active:scale-[0.98] relative"
  >
    {/* Gradient accent top */}
    <div className={`h-1.5 w-full ${
      recipe.difficulty === "Ușor" ? "bg-gradient-to-r from-green-600 to-green-400"
        : recipe.difficulty === "Mediu" ? "bg-gradient-to-r from-amber-600 to-yellow-400"
        : "bg-gradient-to-r from-red-700 to-red-400"
    }`} />

    <div className="p-5 space-y-3 bg-white/[0.04]">
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.06] flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
          {recipe.icon}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
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
        <h2 className="text-lg font-black text-white group-hover:text-red-400 transition-colors leading-snug">{recipe.name}</h2>
        <p className="text-gray-400 text-sm mt-1 line-clamp-2 leading-relaxed">{recipe.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-500">
        <span className="flex items-center gap-1 bg-white/[0.04] px-2.5 py-1 rounded-lg">⏱️ {recipe.totalLabel}</span>
        <span className="flex items-center gap-1 bg-white/[0.04] px-2.5 py-1 rounded-lg">🍽️ {recipe.servings} {recipe.servingsUnit}</span>
        <span className="flex items-center gap-1 bg-white/[0.04] px-2.5 py-1 rounded-lg">🔥 {recipe.calories} kcal</span>
      </div>

      <div className="pt-2 border-t border-white/[0.04]">
        <span className="text-xs font-bold text-red-400 group-hover:text-red-300 transition-colors flex items-center gap-1">
          Deschide rețeta <span className="group-hover:translate-x-1 transition-transform">→</span>
        </span>
      </div>
    </div>
  </motion.button>
);

// ─── Smart unit formatting ──────────────────────────────────────────────────
const formatQuantity = (qty, unit, multiplier) => {
  if (qty === null || qty === undefined) return { display: "", unit: "" };
  const raw = qty * multiplier;

  // kg ↔ g conversion
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

  // l ↔ ml conversion
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

  // linguri, buc, etc — round to nearest 0.5
  if (unit === "buc" || unit === "căței" || unit === "ramuri" || unit === "linguri" || unit === "lingură" || unit === "lingurită" || unit === "legătură") {
    const rounded = Math.round(raw * 2) / 2;
    return { display: rounded, unit };
  }

  // Pass through
  const val = Math.round(raw * 10) / 10;
  return { display: val, unit };
};

// ─── Render one ingredient line ────────────────────────────────────────────
const formatIngredient = (ing, multiplier) => {
  // Non-scalable items show as-is (sare, piper etc)
  if (ing.scalable === false && !ing.textFn) {
    return { qtyText: "", nameText: ing.name, isDescriptive: true };
  }

  // Custom text function (for descriptive items like "coajă de lămâie")
  if (ing.textFn) {
    return { qtyText: "", nameText: ing.textFn(multiplier), isDescriptive: true };
  }

  // Standard scalable ingredient
  const fmt = formatQuantity(ing.qty, ing.unit, multiplier);
  if (fmt.display === "") return { qtyText: "", nameText: ing.name, isDescriptive: true };
  return { qtyText: `${fmt.display} ${fmt.unit}`, nameText: ing.name, isDescriptive: false };
};

// ─── Interactive Ingredient List ────────────────────────────────────────────
const IngredientList = ({ ingredients, multiplier, title }) => {
  if (!ingredients || ingredients.length === 0) return null;
  return (
    <div className="space-y-0.5">
      {title && <h4 className="text-sm font-bold uppercase tracking-widest text-red-400 mb-3">{title}</h4>}
      {ingredients.map((ing, i) => {
        const { qtyText, nameText, isDescriptive } = formatIngredient(ing, multiplier);
        return (
          <div key={i} className="flex items-baseline gap-2 py-2 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500/40 flex-shrink-0 relative top-[-1px]" />
            {isDescriptive ? (
              <span className="text-gray-200 text-sm md:text-base font-medium">{nameText}</span>
            ) : (
              <>
                <span className="text-red-400 font-black text-sm tabular-nums whitespace-nowrap">{qtyText}</span>
                <span className="text-gray-200 text-sm md:text-base font-medium">{nameText}</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Step-by-Step with Beautiful Design ─────────────────────────────────────
const StepByStep = ({ steps, recipeId, tips }) => {
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
      {/* Header + progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            👨‍🍳 Pași de Preparare
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500">{checked.length}/{steps.length} pași</span>
            {checked.length > 0 && (
              <button onClick={resetAll} className="text-xs text-gray-500 hover:text-red-400 transition-colors font-bold underline underline-offset-2">
                Resetează
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 -mt-2">
        <span className="inline-flex w-5 h-5 rounded-full border border-white/[0.15] items-center justify-center text-[10px] text-gray-500">1</span>
        Apasă pe un pas pentru a-l bifa ca terminat
      </p>

      {/* Steps timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-white/[0.06]" />

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
                    isDone
                      ? "bg-green-900/10"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Step number circle */}
                  <span className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${
                    isDone
                      ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/30"
                      : "bg-[#141111] border-white/[0.15] text-gray-400"
                  }`}>
                    {isDone ? "✓" : idx + 1}
                  </span>

                  <div className="flex-1 min-w-0 pt-1">
                    <span className={`text-sm md:text-base font-medium leading-relaxed block transition-all ${
                      isDone ? "text-gray-500 line-through decoration-green-600/50" : "text-gray-200"
                    }`}>
                      {stepData.text}
                    </span>

                    {/* Inline tip */}
                    {stepData.tip && !isDone && (
                      <span className="mt-1.5 flex items-start gap-1.5 text-xs md:text-sm text-amber-400/70 bg-amber-900/10 px-2.5 py-1.5 rounded-lg border border-amber-900/15">
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

      {/* Completion celebration */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6 bg-gradient-to-br from-green-900/20 to-amber-900/10 border border-green-900/20 rounded-2xl"
        >
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-green-400 font-black text-lg">Felicitări! Rețeta este gata!</p>
          <p className="text-gray-500 text-sm mt-1">Poftă bună și Paște Fericit!</p>
        </motion.div>
      )}

      {/* Tips section */}
      {tips && tips.length > 0 && (
        <div className="bg-amber-900/10 border border-amber-900/15 rounded-2xl p-5 space-y-3">
          <h4 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
            💡 Sfaturi de Bucătar
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
const RecipeDetail = ({ recipe, onBack }) => {
  const [servingsInput, setServingsInput] = useState(String(recipe.servings));
  const targetServings = Math.max(1, parseInt(servingsInput) || recipe.servings);
  const multiplier = targetServings / recipe.servings;

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
      className="space-y-6"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors font-bold text-sm active:scale-95"
      >
        ← Înapoi la rețete
      </button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900/20 via-white/[0.04] to-amber-900/10 border border-white/[0.06] p-5 md:p-8">
        <div className="absolute top-3 right-3 text-6xl md:text-7xl opacity-15 select-none">{recipe.icon}</div>
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/[0.08] flex items-center justify-center text-3xl md:text-5xl">
              {recipe.icon}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              recipe.difficulty === "Ușor"
                ? "bg-green-900/20 text-green-400 border-green-900/30"
                : recipe.difficulty === "Mediu"
                  ? "bg-yellow-900/20 text-yellow-400 border-yellow-900/30"
                  : "bg-red-900/20 text-red-400 border-red-900/30"
            }`}>
              {recipe.difficulty}
            </span>
          </div>
          <h1 className="text-xl md:text-4xl font-black text-white leading-tight">{recipe.name}</h1>
          <p className="text-gray-400 mt-1.5 leading-relaxed text-sm">{recipe.description}</p>
        </div>
      </div>

      {/* Stats row — scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {[
          { icon: "⏱️", label: "Prep", value: recipe.prepLabel },
          { icon: "🔥", label: "Gătire", value: recipe.cookLabel },
          { icon: "⏳", label: "Total", value: recipe.totalLabel },
          { icon: "🍽️", label: "Porții", value: `${targetServings} ${recipe.servingsUnit}` },
          { icon: "💪", label: "Calorii", value: `${recipe.calories} kcal` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center flex-shrink-0 min-w-[80px]">
            <span className="text-base block">{stat.icon}</span>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">{stat.label}</p>
            <p className="text-xs font-bold text-white whitespace-nowrap">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Ingredients section with free-form servings */}
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2 flex-shrink-0">
            🥄 Ingrediente
          </h3>
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06] flex-shrink-0">
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
                className="w-8 text-center bg-transparent text-white font-black text-base outline-none"
                maxLength={3}
              />
              <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">{recipe.servingsUnit}</span>
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
            <span>📐</span> Cantitățile sunt ajustate pentru {targetServings} {recipe.servingsUnit} (×{multiplier % 1 === 0 ? multiplier : multiplier.toFixed(2)})
          </p>
        )}

        <IngredientList ingredients={recipe.baseIngredients} multiplier={multiplier} />
        {recipe.filling.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <IngredientList ingredients={recipe.filling} multiplier={multiplier} title="Umplutură" />
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 md:p-6">
        <StepByStep steps={recipe.steps} recipeId={recipe.id} tips={recipe.tips} />
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
    "image": "https://ciocnim.ro/og-image.jpg",
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
      ...r.baseIngredients.map(i => i.textFn ? i.textFn(1) : `${i.qty || ""} ${i.unit} ${i.name}`.trim()),
      ...r.filling.map(i => `${i.qty} ${i.unit} ${i.name}`.trim()),
    ],
    "recipeInstructions": r.steps.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "text": typeof step === "string" ? step : step.text,
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

        <div className="w-full max-w-5xl mx-auto pt-8 pb-16 px-6">
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
                  <p className="text-gray-400 font-bold text-sm md:text-base max-w-lg mx-auto">
                    8 rețete tradiționale ale mesei festive. Pas cu pas, cu sfaturi și cantități ajustabile.
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
