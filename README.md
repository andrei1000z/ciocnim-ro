# 🥚 Ciocnim.ro

Un joc online de ciocnit ouă de Paște — joacă cu prietenii, familia, sau cu cineva aleatoriu din toată țara.

**[→ ciocnim.ro](https://ciocnim.ro)**

---

## Ce e asta?

De Paște, românii ciocnesc ouă roșii — o tradiție veche de sute de ani. Ciocnim.ro aduce tradiția online: poți juca cu oricine, de oriunde, în timp real.

- **Arena Națională** — intri și în câteva secunde ești conectat cu un alt jucător din România
- **Cameră Privată** — trimiți un link prietenului și jucați față în față
- **Grupuri** — creezi un grup cu familia sau colegii, fiecare cu clasament propriu
- **Bot fallback** — dacă nu găsești adversar în 7 secunde, te joci cu un bot

---

## Cum funcționează

1. Îți pui o poreclă și alegi culoarea oului
2. Alegi regiunea ta (Muntenia, Moldova, Transilvania, Diaspora...)
3. Intri în arenă sau trimiți un link unui prieten
4. Unul ciocnește, celălalt apără — 50/50 aleator
5. Câștigătorul urcă în clasamentul național

---

## Tech stack

| Componentă | Tehnologie |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Animații | Framer Motion 12 |
| Real-time | Pusher (WebSocket) |
| Bază de date | Upstash Redis |
| Hosting | Vercel |

---

## Rulare locală

```bash
npm install
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000).

Ai nevoie de un fișier `.env.local` cu:

```
NEXT_PUBLIC_PUSHER_KEY=...
PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_CLUSTER=...
REDIS_URL=...
```

---

## Deploy

```bash
git push origin main
```

Vercel preia automat și deployează.

---

## Pagini

| Rută | Ce e |
|---|---|
| `/` | Pagina principală — joc, clasamente, setări |
| `/joc/[room]` | Camera de joc live |
| `/traditii` | Istoria și obiceiurile de Paște |
| `/vopsit-natural` | Cum vopsești ouă natural |
| `/urari` | Urări tradiționale de Paște |
| `/calendar` | Datele Paștelui 2026–2030 |

---

**Hristos a Înviat!** 🥚
