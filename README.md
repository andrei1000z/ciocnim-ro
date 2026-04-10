# 🥚 Ciocnim.ro

Joc multiplayer de ciocnit oua de Paste -- traditia romaneasca, acum online.
Joaca cu prietenii, familia sau cu cineva aleatoriu din toata tara, in timp real.

**[ciocnim.ro](https://ciocnim.ro)**

## Tech Stack

- **Next.js 16** + **React 19** -- App Router, React Compiler
- **Tailwind CSS 4** -- styling
- **Pusher** -- WebSocket real-time multiplayer
- **Upstash Redis** -- leaderboards, sessions, persistence
- **Framer Motion** -- animatii
- **Vitest** -- testing

## Features

- Multiplayer real-time (arena publica + camere private)
- 3 limbi: romana (RO), bulgara (BG), greaca (EL)
- Achievements si statistici per jucator
- Clasament national si pe regiuni
- Echipe / grupuri cu clasament propriu
- Retete traditionale de Paste
- Traditii si obiceiuri de Paste
- PWA -- instalabil pe telefon

## Getting Started

```bash
git clone https://github.com/your-user/ciocnim-ro.git
cd ciocnim-ro
npm install
npm run dev
```

Creaza un fisier `.env.local`:

```
NEXT_PUBLIC_PUSHER_KEY=...
PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_CLUSTER=...
REDIS_URL=...
```

Deschide [http://localhost:3000](http://localhost:3000).

## Scripts

| Comanda          | Descriere                  |
| ---------------- | -------------------------- |
| `npm run dev`    | Server de dezvoltare       |
| `npm run build`  | Build productie            |
| `npm start`      | Porneste serverul prod     |
| `npm test`       | Ruleaza testele (Vitest)   |
| `npm run lint`   | Lint cu ESLint             |

## Project Structure

```
app/
  [locale]/    -- pagini per limba (ro, bg, el)
  api/         -- API routes (Pusher, Redis, auth)
  components/  -- componente React partajate
  i18n/        -- traduceri si configurare i18n
  lib/         -- utilitare, helpers, constante
public/        -- assets statice, manifest, icons
tests/         -- teste Vitest
```

## i18n

Limbi suportate: **RO** (romana), **BG** (bulgara), **EL** (greaca).
Rutele sunt prefixate cu locale: `/ro/clasament`, `/bg/klasirane`, `/el/katataxi`.

## Deploy

Proiectul se deployeaza automat pe **Vercel** la push pe `main`.

```bash
git push origin main
```

---

**Hristos a Inviat!**
