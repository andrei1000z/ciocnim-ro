import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import Pusher from 'pusher';

/**
 * ====================================================================================================
 * CIOCNIM.RO - API ENDPOINT PRINCIPAL (SERVER ROUTE BACKEND V22.0 - THE NATIONAL AWAKENING)
 * ====================================================================================================
 * Proiect: Platformă de ciocnit ouă virtuale, optimizată SEO și UX.
 * Tehnologii: Next.js 16 (Server Actions/Route Handlers), Upstash Redis (DB), Pusher (WebSockets).
 * * * * 📜 ROLUL ACESTUI FIȘIER (CREIERUL APLICAȚIEI):
 * Acest fișier reprezintă singurul punct de contact între telefoanele jucătorilor și baza 
 * noastră de date. Tot ce se întâmplă în joc (spargerea unui ou, trimiterea unui mesaj, 
 * provocarea la duel) trece pe aici printr-o cerere de tip POST. 
 * * * * 🛠️ ACTUALIZĂRI ȘI OPTIMIZĂRI IMPLEMENTATE (V22.0 CORE SYNC):
 * 1. PROVOCĂRI LIVE (Sistem de Notificări): Am integrat acțiunea `provocare-duel`. Acum putem
 * trimite evenimente direcționate către canale specifice de utilizator (`user-notif-[Nume]`).
 * 2. SINCRONIZARE (HANDSHAKE): Am păstrat acțiunea de 'ping' / 'handshake' pentru a asigura
 * confirmarea bidirecțională între telefoane înainte de luptă.
 * 3. LOGICĂ DE LUPTĂ (FAIR-PLAY MATH): Algoritmul `lovitura` a fost calibrat. Oul de aur 
 * are win rate 100%. Pentru restul, intensitatea loviturii (fie că e din accelerație sau click) 
 * crește șansele de victorie (60/40 split).
 * 4. REDIS PIPELINE & TTL: Pachete de comenzi executate simultan (Pipeline) și camere 
 * private care expiră automat după 1 oră (TTL - Time To Live) pentru a curăța memoria RAM.
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
    const { 
      actiune, roomId, jucator, skin, intensity, teamId, winner, 
      newName, text, isGolden, hasStar, 
      oponentNume, teamName // Noi adăugate pentru V22 (Sistemul de Provocări)
    } = body;

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
        if (!roomId || !jucator) return NextResponse.json({ success: false, error: "Date incomplete (roomId sau jucator)" }, { status: 400 });
        
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
       * ACȚIUNE: 'handshake' / 'ping' 
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
       * Momentul impactului fizic sau al apăsării butonului (V22).
       * Serverul primește intensitatea și calculează matematic cine câștigă.
       */
      case 'lovitura': {
        if (!roomId) return NextResponse.json({ success: false, error: "Lipsește camera" }, { status: 400 });

        // [LOGICA DE JOC V22]: Fair-play și Noroc calibrat.
        // Nu câștigă mereu cel care dă mai tare, dar are un avantaj considerabil.
        // Oul de Aur ignoră fizica și distruge orice.
        let castigaCelCareDa = false;
        
        if (isGolden) {
           // Dacă cel care lovește are Oul de Aur (șansă rară), câștigă automat (God Mode).
           castigaCelCareDa = true;
        } else {
           // Dacă lovești tare (forță > 15 sau click), ai 60% șanse. Dacă dai încet, ai doar 40%.
           const fortaImpactului = intensity || 20; // Default 20 pentru button-click
           castigaCelCareDa = fortaImpactului > 15 ? Math.random() < 0.6 : Math.random() < 0.4;
        }
        
        // Trimitem verdictul serverului instant către ambii jucători pe canalul arenei
        await pusher.trigger(`arena-${roomId}`, 'lovitura', {
          jucator: jucator, 
          intensity: intensity || 20, 
          castigaCelCareDa: castigaCelCareDa, 
          t: Date.now()
        });
        
        return NextResponse.json({ success: true, impact: intensity, castigator: castigaCelCareDa });
      }

      /**
       * ACȚIUNE: 'resolve-match'
       * Meciul este gata. Aici actualizăm statisticile Echipei/Clanului în baza de date.
       */
      case 'resolve-match': {
        // Inițializăm un Pipeline Redis pentru a executa toate modificările simultan (viteza e crucială)
        const pipeline = redis.pipeline();
        
        // Dacă jucătorul face parte dintr-un clan/grup, îi adăugăm punctele
        if (teamId && winner) {
          // Calculăm Punctele de Experiență (XP). O lovitură mai puternică aduce puțin mai mult XP.
          const puncteCastigate = Math.floor((intensity || 15) * 1.5);
          
          // 1. Creștem statisticile globale ale Echipei (XP Total și număr de Victorii)
          pipeline.hincrby(`team:${teamId}:stats`, 'victorii', 1);
          pipeline.hincrby(`team:${teamId}:stats`, 'xp_total', puncteCastigate);
          
          // 2. Creștem scorul jucătorului în clasamentul intern al familiei (Sorted Set)
          pipeline.zincrby(`team:${teamId}:membri`, puncteCastigate, winner);
        }

        // Executăm tranzacția completă în baza de date dintr-un singur foc
        await pipeline.exec();
        
        return NextResponse.json({ success: true, message: "Statisticile clanului au fost salvate." });
      }

      /**
       * ACȚIUNE: 'arena-chat'
       * Trimite un mesaj în fereastra de sticlă (Liquid Glass) din Arenă.
       */
      case 'arena-chat': {
        if (!roomId || !text) return NextResponse.json({ success: false }, { status: 400 });

        // Folosim același canal, dar un eveniment complet separat ('arena-chat') pentru a nu interfera cu meciul
        await pusher.trigger(`arena-${roomId}`, 'arena-chat', {
          jucator: jucator, 
          text: text, 
          t: Date.now()
        });
        
        return NextResponse.json({ success: true });
      }

      // ==============================================================================
      // SECȚIUNEA B: SISTEMUL NAȚIONAL DE STATISTICI ȘI NOTIFICĂRI
      // ==============================================================================

      /**
       * ACȚIUNE: 'increment-global'
       * Funcția care face numărătorul general de "Ouă Sparte" de pe Acasă să crească.
       */
      case 'increment-global': {
        // Incrementăm atomic cheia unică globală din Redis
        const noulTotal = await redis.incr('global_ciocniri_total');
        
        // Notificăm TOȚI utilizatorii de pe site că s-a mai spart un ou.
        // Canalul 'global' este ascultat de toți vizitatorii în ClientWrapper.
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

      /**
       * ACȚIUNE: 'provocare-duel' (NOU V22)
       * Trimite un pop-up de notificare direct pe ecranul unui prieten.
       */
      case 'provocare-duel': {
        if (!oponentNume || !jucator || !roomId) {
          return NextResponse.json({ success: false, error: "Lipsesc parametri esențiali pentru provocare." }, { status: 400 });
        }

        // Trimitem pe canalul personalizat al oponentului (ascultat în ClientWrapper)
        await pusher.trigger(`user-notif-${oponentNume}`, 'duel-request', {
          deLa: jucator,
          roomId: roomId,
          teamId: teamId || null,
          teamName: teamName || null,
          t: Date.now()
        });

        return NextResponse.json({ success: true, message: `Provocare trimisă către ${oponentNume}` });
      }

      // ==============================================================================
      // SECȚIUNEA C: MANAGEMENTUL CLANURILOR ȘI GRUPURILOR
      // ==============================================================================
      
      /**
       * ACȚIUNE: 'creeaza-echipa'
       */
      case 'creeaza-echipa': {
        const creator = body.creator;
        if (!creator) return NextResponse.json({ success: false, error: "Numele identității este obligatoriu." }, { status: 400 });

        // Generăm un Cod Unic pentru grup (ex: OU-X9F2A1)
        const newTeamId = `OU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        // Configurăm Hash-ul de baze de date pentru noul grup
        await redis.set(`team:${newTeamId}:nume`, `GRUPUL LUI ${creator.toUpperCase()}`);
        await redis.hset(`team:${newTeamId}:stats`, {
          creator: creator,
          data_creare: Date.now(),
          victorii: 0,
          xp_total: 0
        });
        
        // Adăugăm fondatorul în clasamentul de Sorted Sets (zadd) cu scor 0 inițial
        await redis.zadd(`team:${newTeamId}:membri`, { score: 0, member: creator });
        
        return NextResponse.json({ success: true, teamId: newTeamId });
      }

      /**
       * ACȚIUNE: 'get-team-details'
       * Returnează datele și clasamentul formatat pentru Panoul Echipei.
       */
      case 'get-team-details': {
        if (!teamId) return NextResponse.json({ success: false }, { status: 400 });

        const teamData = await redis.hgetall(`team:${teamId}:stats`);
        if (!teamData) return NextResponse.json({ success: false, error: "Grupul (Sanctuarul) nu a fost găsit." }, { status: 404 });

        const teamName = await redis.get(`team:${teamId}:nume`) || "Grup Ciocnim.ro";
        
        // Auto-Adăugare: Dacă cineva intră cu un link valabil de invite, îl validăm și îl adăugăm în clan
        if (jucator) {
          const scorCurent = await redis.zscore(`team:${teamId}:membri`, jucator);
          if (scorCurent === null) {
            await redis.zadd(`team:${teamId}:membri`, { score: 0, member: jucator });
          }
        }

        // Extragem TOP 50 jucători, ordonați descrescător după scor
        const topMembri = await redis.zrange(`team:${teamId}:membri`, 0, 49, { rev: true, withScores: true });
        
        // Formatăm array-ul plat întors de Redis într-un array de obiecte ușor de mapat în React
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
        return NextResponse.json({ success: false, error: "Numele dorit este prea scurt (min. 3 caractere)." }, { status: 400 });
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
        // Aici am setat 3600 de secunde (1 oră). După asta, camera expiră și dispare din server (Garbage Collection).
        await redis.setex(`room:${codCamera}`, 3600, JSON.stringify({
          creator: body.creator || "Necunoscut",
          status: 'asteptare_prieten',
          creata_la: Date.now()
        }));

        return NextResponse.json({ success: true, cod: codCamera });
      }

      // Orice altă acțiune nespecificată este respinsă pentru securitatea rețelei
      default:
        return NextResponse.json({ success: false, error: "Acțiune nesuportată de Neural Core." }, { status: 400 });
    }
  } catch (error) {
    // Un bloc catch global protejează aplicația în cazul în care Redis pică temporar
    // sau datele trimise din frontend au un format JSON malformat.
    console.error("[CIOCNIM.RO API CRITICAL ERROR]:", error);
    return NextResponse.json({ success: false, error: "Eroare internă de server (Sanctuarul este Offline)." }, { status: 500 });
  }
}