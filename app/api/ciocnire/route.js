import Pusher from "pusher";
import { NextResponse } from "next/server";
import { Redis } from '@upstash/redis';

// Inițializăm Pusher pentru comunicare live
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

// Inițializăm baza de date pentru Counter și Matchmaking
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { roomId, actiune, jucator } = body;

    // SCENARIUL 1: S-a lovit un ou
    if (actiune === 'lovitura') {
      const castigaCelCareDa = Math.random() < 0.5; // 50/50 șanse pur matematice
      await pusher.trigger(`camera-${roomId}`, 'lovitura', { ...body, castigaCelCareDa });
      
      // Mărim counter-ul GLOBAL în baza de date cu +1
      const totalOua = await redis.incr('total_oua_sparte');
      
      // Anunțăm toți jucătorii de pe site să își actualizeze numărul
      await pusher.trigger('global', 'ou-spart', { total: totalOua });
    } 
    // SCENARIUL 2: Deconectare
    else if (actiune === 'paraseste') {
      await pusher.trigger(`camera-${roomId}`, 'adversar-iesit', {});
    }
    // SCENARIUL 3: Sistem NOU de Matchmaking Aleatoriu
    else if (actiune === 'cauta-random') {
      // Verificăm dacă există cineva în "sala de așteptare"
      const cameraAsteptare = await redis.lpop('coada_matchmaking');

      if (cameraAsteptare) {
        // Am găsit pe cineva! Îl trimitem direct în camera aia
        return NextResponse.json({ success: true, matchFound: true, roomId: cameraAsteptare });
      } else {
        // Nu e nimeni. Îl punem pe el în coadă să aștepte
        await redis.rpush('coada_matchmaking', roomId);
        // Expiră camera din coadă după 30 secunde ca să nu se blocheze sistemul
        await redis.expire('coada_matchmaking', 30);
        return NextResponse.json({ success: true, matchFound: false, roomId });
      }
    } 
    // SCENARIUL 4: Solicitare Counter la intrarea pe site
    else if (actiune === 'get-counter') {
      const total = await redis.get('total_oua_sparte') || 0;
      return NextResponse.json({ success: true, total });
    }
    // ALTELE: Sincronizare ouă, reacții, revanșă
    else {
      await pusher.trigger(`camera-${roomId}`, actiune, body);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Eroare API:", error);
    return NextResponse.json({ success: false, error: "A apărut o eroare la server." }, { status: 500 });
  }
}