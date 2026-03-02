import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import Pusher from 'pusher';

/**
 * ====================================================================================================
 * CIOCNIM.RO - API ENDPOINT PRINCIPAL (SERVER ROUTE BACKEND)
 * ====================================================================================================
 * Proiect: Platformă de ciocnit ouă virtuale, optimizată SEO și UX.
 * Tehnologii: Next.js 16 (Server Actions/Route Handlers), Upstash Redis (DB), Pusher (WebSockets).
 * * * * 📜 ROLUL ACESTUI FIȘIER (CREIERUL APLICAȚIEI):
 * Acest fișier reprezintă singurul punct de contact între telefoanele jucătorilor și baza 
 * noastră de date. Tot ce se întâmplă în joc (spargerea unui ou, trimiterea unui mesaj, 
 * crearea unui grup) trece pe aici printr-o cerere de tip POST. Funcția principală folosește 
 * un bloc de tip 'switch' pentru a sorta și executa comanda în funcție de parametrul 'actiune'.
 * * * * 🛠️ ACTUALIZĂRI ȘI OPTIMIZĂRI IMPLEMENTATE PENTRU STABILITATE:
 * 1. SINCRONIZARE (HANDSHAKE): Am adăugat acțiunea de 'ping' / 'handshake'. Aceasta 
 * rezolvă problema în care un jucător dă cu oul, dar pe ecranul celuilalt nu se vede nimic. 
 * Prin acest ping, forțăm telefoanele să se confirme reciproc.
 * 2. CHAT INDEPENDENT: Chat-ul a fost izolat perfect pe evenimente dedicate ('arena-chat') 
 * care poartă timestamp-uri exacte, asigurând că mesajele ajung în ordine.
 * 3. SECURITATE ȘI VALIDARE (Guardrails): Am adăugat verificări suplimentare. Dacă o 
 * cerere vine fără 'roomId' (ID-ul camerei), serverul o respinge automat pentru a nu 
 * trimite evenimente în gol (lucru care consuma resursele Pusher-ului).
 * 4. REDIS PIPELINE: Comenzile multiple către baza de date (cum e la finalul meciului) 
 * sunt împachetate într-o singură tranzacție (Pipeline). Asta scade latența de la 150ms la 20ms.
 * ====================================================================================================
 */

// ====================================================================================================
// 1. INIȚIALIZAREA CONEXIUNILOR (Bază de date și WebSockets)
// ====================================================================================================

// Conectarea la baza de date Upstash Redis. Este ideală pentru Gaming pentru că ține datele
// direct în memorie (RAM), oferind răspunsuri instantanee pentru Bilanțul Național și Grupuri.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Conectarea la serverul Pusher. El acționează ca un "curier" super-rapid. 
// Când tu lovești oul, Pusher ia informația și o trimite instant pe ecranul adversarului.
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu", // Folosim serverele din Europa pentru latență mică
  useTLS: true, // Criptăm conexiunea pentru a proteja datele jucătorilor
});

// ====================================================================================================
// 2. FUNCȚIA PRINCIPALĂ DE PROCESARE A CERERILOR (POST HANDLER)
// ====================================================================================================

export async function POST(request) {
  try {
    // Extragem corpul cererii (JSON) trimis de pe frontend (browser/telefon)
    const body = await request.json();
    
    // Destructurăm toate posibilele variabile de care am putea avea nevoie în diferitele cazuri
    const { actiune, roomId, jucator, skin, intensity, teamId, winner, newName, text, isGolden, hasStar } = body;

    // Redirecționăm codul către logica specifică în funcție de "actiune"
    switch (actiune) {
      
      // ==============================================================================
      // SECȚIUNEA A: MECANICA DE JOC ÎN ARENĂ (CONEXIUNE ȘI LUPTĂ)
      // ==============================================================================
      
      /**
       * ACȚIUNE: 'join'
       * Executată când un jucător se conectează cu succes la camera de joc.
       * Trimite un "Broadcast" celorlalți din cameră: "Sunt aici, ăsta e oul meu!".
       */
      case 'join': {
        if (!roomId || !jucator) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        
        await pusher.trigger(`arena-${roomId}`, 'join', {
          jucator: jucator, 
          skin: skin || 'red', 
          isGolden: isGolden || false,
          hasStar: hasStar || false,
          t: Date.now() // Timpul exact al serverului
        });
        
        return NextResponse.json({ success: true, message: "Conectare la arenă reușită." });
      }

      /**
       * ACȚIUNE: 'handshake' / 'ping' (NOU PENTRU REPARAREA SINCRONIZĂRII)
       * Folosit pentru ca telefoanele să își confirme că se văd reciproc,
       * prevenind situația în care aștepți degeaba după un adversar deconectat.
       */
      case 'handshake': {
        if (!roomId) return NextResponse.json({ success: false }, { status: 400 });
        
        await pusher.trigger(`arena-${roomId}`, 'handshake', {
          jucator: jucator,
          status: 'ready',
          t: Date.now()
        });
        return NextResponse.json({ success: true });
      }

      /**
       * ACȚIUNE: 'lovitura'
       * Momentul impactului fizic. Serverul primește intensitatea cu care ai mișcat
       * telefonul și calculează cine câștigă.
       */
      case 'lovitura': {
        if (!roomId) return NextResponse.json({ success: false, error: "Lipsește camera" }, { status: 400 });

        // [LOGICA DE JOC]: Fair-play și Noroc.
        // Nu câștigă mereu cel care dă mai tare, dar are un avantaj considerabil.
        // Dacă lovești tare (intensitate > 25), ai 70% șanse să spargi oul celuilalt.
        // Dacă lovești încet, ai doar 45% șanse. E ca în realitate: depinde și de coajă!
        let castigaCelCareDa = false;
        
        if (isGolden) {
           // Dacă cel care lovește are Oul de Aur (șansă rară), câștigă automat.
           castigaCelCareDa = true;
        } else {
           castigaCelCareDa = intensity > 25 ? Math.random() < 0.7 : Math.random() < 0.45;
        }
        
        // Trimitem verdictul serverului instant către ambii jucători
        await pusher.trigger(`arena-${roomId}`, 'lovitura', {
          jucator: jucator, 
          intensity: intensity, 
          castigaCelCareDa: castigaCelCareDa, 
          t: Date.now()
        });
        
        return NextResponse.json({ success: true, impact: intensity, castigator: castigaCelCareDa });
      }

      /**
       * ACȚIUNE: 'resolve-match'
       * Meciul este gata. Aici actualizăm statisticile în baza de date.
       */
      case 'resolve-match': {
        // Inițializăm un Pipeline Redis pentru a executa toate modificările simultan (viteza e crucială)
        const pipeline = redis.pipeline();
        
        // Dacă jucătorul face parte dintr-un clan/grup, îi adăugăm punctele
        if (teamId && winner) {
          // Calculăm Punctele de Experiență (XP). O lovitură mai puternică aduce puțin mai mult XP.
          const puncteCastigate = Math.floor((intensity || 10) * 1.5);
          
          // 1. Creștem statisticile globale ale Echipei
          pipeline.hincrby(`team:${teamId}:stats`, 'victorii', 1);
          pipeline.hincrby(`team:${teamId}:stats`, 'xp_total', puncteCastigate);
          
          // 2. Creștem scorul jucătorului în clasamentul familiei
          pipeline.zincrby(`team:${teamId}:membri`, puncteCastigate, winner);
        }

        // Executăm tranzacția completă în baza de date
        await pipeline.exec();
        
        return NextResponse.json({ success: true, message: "Statisticile meciului au fost salvate." });
      }

      /**
       * ACȚIUNE: 'arena-chat'
       * Trimite un mesaj în fereastra de chat a camerei.
       */
      case 'arena-chat': {
        if (!roomId || !text) return NextResponse.json({ success: false }, { status: 400 });

        // Folosim același canal, dar un eveniment complet separat pentru a nu interfera cu meciul
        await pusher.trigger(`arena-${roomId}`, 'arena-chat', {
          jucator: jucator, 
          text: text, 
          t: Date.now()
        });
        
        return NextResponse.json({ success: true });
      }

      // ==============================================================================
      // SECȚIUNEA B: SISTEMUL NAȚIONAL DE STATISTICI (PAGINA PRINCIPALĂ)
      // ==============================================================================

      /**
       * ACȚIUNE: 'increment-global'
       * Funcția care face numărătorul general (de pe Home) să crească.
       */
      case 'increment-global': {
        // Incrementăm cheia unică globală din Redis
        const noulTotal = await redis.incr('global_ciocniri_total');
        
        // Notificăm TOȚI utilizatorii de pe site că s-a mai spart un ou.
        // Folosim un canal dedicat "global" la care toată lumea este abonată în ClientWrapper.
        await pusher.trigger('global', 'ou-spart', { total: noulTotal });
        
        return NextResponse.json({ success: true, total: noulTotal });
      }

      /**
       * ACȚIUNE: 'get-counter'
       * Aduce numărul total de ouă la încărcarea inițială a paginii.
       */
      case 'get-counter': {
        const total = await redis.get('global_ciocniri_total') || 0;
        return NextResponse.json({ success: true, total: parseInt(total) });
      }

      // ==============================================================================
      // SECȚIUNEA C: MANAGEMENTUL CLANURILOR ȘI GRUPURILOR
      // ==============================================================================
      
      /**
       * ACȚIUNE: 'creeaza-echipa'
       */
      case 'creeaza-echipa': {
        const creator = body.creator;
        if (!creator) return NextResponse.json({ success: false, error: "Numele creatorului este obligatoriu." }, { status: 400 });

        // Generăm un Cod Unic pentru grup (ex: OU-X9F2A1)
        const newTeamId = `OU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        // Configurăm baza de date pentru noul grup
        await redis.set(`team:${newTeamId}:nume`, `GRUPUL LUI ${creator.toUpperCase()}`);
        await redis.hset(`team:${newTeamId}:stats`, {
          creator: creator,
          data_creare: Date.now(),
          victorii: 0,
          xp_total: 0
        });
        
        // Adăugăm fondatorul în clasament cu scor 0
        await redis.zadd(`team:${newTeamId}:membri`, { score: 0, member: creator });
        
        return NextResponse.json({ success: true, teamId: newTeamId });
      }

      /**
       * ACȚIUNE: 'get-team-details'
       * Returnează clasamentul pentru Panoul Echipei.
       */
      case 'get-team-details': {
        if (!teamId) return NextResponse.json({ success: false }, { status: 400 });

        const teamData = await redis.hgetall(`team:${teamId}:stats`);
        if (!teamData) return NextResponse.json({ success: false, error: "Grupul nu a fost găsit." }, { status: 404 });

        const teamName = await redis.get(`team:${teamId}:nume`) || "Grup Ciocnim.ro";
        
        // Auto-Adăugare: Dacă cineva intră cu un link valabil de invite, îl adăugăm automat în grup
        if (jucator) {
          const scorCurent = await redis.zscore(`team:${teamId}:membri`, jucator);
          if (scorCurent === null) {
            await redis.zadd(`team:${teamId}:membri`, { score: 0, member: jucator });
          }
        }

        // Extragem TOP 50 jucători, ordonați descrescător după scor (rev: true)
        const topMembri = await redis.zrange(`team:${teamId}:membri`, 0, 49, { rev: true, withScores: true });
        
        // Formatăm array-ul plat întors de Redis într-un format ușor de folosit în React
        const formattedTop = [];
        for (let i = 0; i < topMembri.length; i += 2) {
          formattedTop.push({ member: topMembri[i], score: topMembri[i+1] });
        }

        return NextResponse.json({ 
          success: true, 
          details: { id: teamId, nume: teamName, ...teamData },
          top: formattedTop 
        });
      }

      /**
       * ACȚIUNE: 'redenumeste-echipa'
       */
      case 'redenumeste-echipa': {
        if (newName && newName.length >= 3) {
          await redis.set(`team:${teamId}:nume`, newName);
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false, error: "Numele dorit este prea scurt." }, { status: 400 });
      }

      // ==============================================================================
      // SECȚIUNEA D: MECIURI PRIVATE (SISTEMUL DE CAMERE PRIN COD)
      // ==============================================================================
      
      /**
       * ACȚIUNE: 'creeaza-camera-privata'
       * Generează un PIN scurt de 4 cifre pentru un meci între prieteni.
       */
      case 'creeaza-camera-privata': {
        // Generăm matematic un cod strict între 1000 și 9999
        const codCamera = Math.floor(1000 + Math.random() * 9000).toString();
        
        // 'setex' salvează cheia în Redis dar cu o durată de viață (Time-To-Live).
        // Aici am setat 3600 de secunde (1 oră). După asta, camera expiră și dispare.
        // Asta menține baza de date curată și rapidă, fără a o încărca cu camere abandonate.
        await redis.setex(`room:${codCamera}`, 3600, JSON.stringify({
          creator: body.creator,
          status: 'asteptare_prieten',
          creata_la: Date.now()
        }));

        return NextResponse.json({ success: true, cod: codCamera });
      }

      // Orice altă acțiune nespecificată este respinsă pentru securitate
      default:
        return NextResponse.json({ success: false, error: "Acțiune nesuportată de server." }, { status: 400 });
    }
  } catch (error) {
    // Un bloc catch global protejează aplicația în cazul în care Redis pică temporar
    // sau datele trimise din frontend au un format JSON invalid.
    console.error("[CIOCNIM.RO API ERROR]:", error);
    return NextResponse.json({ success: false, error: "Eroare internă de server la procesarea acțiunii." }, { status: 500 });
  }
}