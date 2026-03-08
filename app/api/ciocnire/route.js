import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import redis from '@/app/lib/redis';

/**
 * ====================================================================================================
 * CIOCNIM.RO - API ENDPOINT (V30.5 - SEPARARE GRUPURI & INCREMENTARE SINGULARĂ)
 * ====================================================================================================
 */

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: "eu",
  useTLS: true,
});

async function getClasamentRegiuni() {
  try {
    const raw = await redis.zrevrange('leaderboard_regiuni', 0, -1, 'WITHSCORES');
    const lista = [];
    for (let i = 0; i < raw.length; i += 2) {
      lista.push({ regiune: raw[i], scor: parseInt(raw[i + 1]) || 0 });
    }
    return lista;
  } catch (e) { return []; }
}

async function getClasamentJucatori() {
  try {
    const raw = await redis.zrevrange('leaderboard_jucatori', 0, 9, 'WITHSCORES'); // Top 10
    const lista = [];
    for (let i = 0; i < raw.length; i += 2) {
      lista.push({ nume: raw[i], scor: parseInt(raw[i + 1]) || 0 });
    }
    return lista;
  } catch (e) { return []; }
}

// Protejăm numele sistemului
const NUME_INTERZISE = ["BOT", "SISTEM", "ADMIN", "ANONIM"];

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      actiune, roomId, jucator, skin, isGolden, hasStar, 
      teamId, regiune, creator, text, newName, oponentNume,
      atacant, esteCastigator, oldName, teamIds
    } = body;

    switch (actiune) {
      
      case 'get-counter': {
        const totalCount = await redis.get('global_ciocniri_total') || 0;
        const topRegiuni = await getClasamentRegiuni();
        const topJucatori = await getClasamentJucatori();
        return NextResponse.json({ success: true, total: parseInt(totalCount), topRegiuni, topJucatori });
      }

      case 'increment-global': {
        const pipeline = redis.pipeline();
        // Aici se contorizează DOAR faptul că a avut loc o lovitură globală pe site
        pipeline.incr('global_ciocniri_total');
        
        // Când frontend-ul trimite "jucator", înseamnă că ACEL jucător a CÂȘTIGAT meciul. Punct.
        // Serverul face doar +1, nu mai acceptă un număr precalculat din front-end care să o ia razna.
        if (jucator && jucator.trim() !== "") {
            const safeName = jucator.trim().toUpperCase();
            
            // +1 în clasamentul global
            pipeline.zincrby('leaderboard_jucatori', 1, safeName);

            // +1 în clasamentul regiunii (dacă jucătorul are regiune setată)
            if (regiune && regiune !== "Alege regiunea..." && regiune.trim() !== "") {
              pipeline.zincrby('leaderboard_regiuni', 1, regiune.trim());
            }

            // +1 DOAR în grupul în care se joacă meciul acum (dacă e cazul)
            if (teamId && teamId !== "null" && teamId !== "") {
                pipeline.zincrby(`team:${teamId}:membri`, 1, safeName);
            }
        }
        
        const results = await pipeline.exec();
        const noulTotal = results[0][1];
        
        const topActualizat = await getClasamentRegiuni();
        const topJucatoriActualizat = await getClasamentJucatori();

        // Update în timp real pentru toți cei de pe Home
        await pusher.trigger('global', 'update-complet', { 
            total: noulTotal, 
            topRegiuni: topActualizat,
            topJucatori: topJucatoriActualizat
        });
        
        return NextResponse.json({ success: true, total: noulTotal, topRegiuni: topActualizat, topJucatori: topJucatoriActualizat });
      }

      case 'join': {
        await pusher.trigger(`arena-v22-${roomId}`, 'join', { 
          jucator: jucator.trim().toUpperCase(), skin, isGolden, hasStar, t: Date.now(), seed: body.seed 
        });
        return NextResponse.json({ success: true });
      }

      case 'lovitura': {
        const castigaCelCareDa = body.castigaCelCareDa !== undefined ? body.castigaCelCareDa : Math.random() < 0.5;
        
        // Lovitura este ACUM pură animație și sincronizare în arenă.
        // Nu se mai ocupă deloc de incrementarea scorului (previne dublurile).
        const pipeline = redis.pipeline();
        pipeline.incr('global_ciocniri_total');
        const pipelineResults = await pipeline.exec();
        const noulTotal = pipelineResults[0][1]; 
        
        const topActualizat = await getClasamentRegiuni();
        const topJucatoriActualizat = await getClasamentJucatori();

        await Promise.all([
          pusher.trigger(`arena-v22-${roomId}`, 'lovitura', { 
            jucator: jucator.trim().toUpperCase(), castigaCelCareDa, atacant: atacant.trim().toUpperCase(), t: Date.now() 
          }),
          pusher.trigger('global', 'update-complet', { 
            total: noulTotal, 
            topRegiuni: topActualizat,
            topJucatori: topJucatoriActualizat
          })
        ]);

        return NextResponse.json({ success: true });
      }

      case 'arena-chat': {
        if (!text || text.trim() === "") return NextResponse.json({ success: false });
        await pusher.trigger(`arena-v22-${roomId}`, 'arena-chat', { 
          jucator: jucator.trim().toUpperCase(), text: text.trim(), t: Date.now() 
        });
        return NextResponse.json({ success: true });
      }

      case 'provocare-duel': {
        if (!oponentNume || !jucator || !roomId) {
          return NextResponse.json({ success: false, error: "Date incomplete" });
        }
        await pusher.trigger(`user-notif-${oponentNume.trim().toUpperCase()}`, 'duel-request', {
          deLa: jucator.trim().toUpperCase(), roomId: roomId, teamId: teamId || null, t: Date.now()
        });
        return NextResponse.json({ success: true });
      }

      case 'schimba-porecla': {
        if (!newName || newName.trim().length < 3) {
            return NextResponse.json({ success: false, error: "Nume prea scurt" });
        }

        const newClean = newName.trim().toUpperCase();
        const oldClean = oldName ? oldName.trim().toUpperCase() : null;

        if (NUME_INTERZISE.includes(newClean)) {
            return NextResponse.json({ success: false, error: "Acest nume este rezervat de sistem." });
        }

        const isTaken = await redis.get(`nume_rezervat:${newClean}`);
        if (isTaken && isTaken !== oldClean) {
            return NextResponse.json({ success: false, error: "Acest nume este deja luat de alt jucător!" });
        }

        const pipeline = redis.pipeline();
        pipeline.set(`nume_rezervat:${newClean}`, "1");

        // CLEAN-UP PERFECT (Fără duplicate în grupuri și topuri)
        if (oldClean && oldClean !== newClean) {
            pipeline.del(`nume_rezervat:${oldClean}`);
            
            // Mutăm scorul din clasamentul global (dacă există)
            const globalScore = await redis.zscore('leaderboard_jucatori', oldClean);
            pipeline.zrem('leaderboard_jucatori', oldClean);
            if (globalScore !== null) {
               pipeline.zadd('leaderboard_jucatori', parseFloat(globalScore), newClean);
            }

            // Înlocuim numele DOAR în grupurile din care face parte, și PĂSTRĂM scorul specific acelui grup
            if (teamIds && Array.isArray(teamIds)) {
                for (const tId of teamIds) {
                    const scorInGrup = await redis.zscore(`team:${tId}:membri`, oldClean);
                    pipeline.zrem(`team:${tId}:membri`, oldClean); // Elimină fantoma veche
                    
                    if (scorInGrup !== null) {
                       pipeline.zadd(`team:${tId}:membri`, parseFloat(scorInGrup), newClean); 
                    } else {
                       pipeline.zadd(`team:${tId}:membri`, 0, newClean);
                    }
                }
            }
        }
        
        await pipeline.exec();

        const topJucatoriActualizat = await getClasamentJucatori();
        await pusher.trigger('global', 'update-complet', { topJucatori: topJucatoriActualizat });

        return NextResponse.json({ success: true });
      }

      case 'get-team-details': {
        if (!teamId) return NextResponse.json({ success: false, error: "Lipsește ID" });
        const teamName = await redis.get(`team:${teamId}:nume`);
        if (!teamName) return NextResponse.json({ success: false, error: "Grup inexistent" });
        
        const teamStats = await redis.hgetall(`team:${teamId}:stats`);
        
        // Dacă jucătorul a intrat pe link-ul de grup, îi forțăm scorul pe 0 (nu aducem cel global)
        if (jucator && jucator.trim().length >= 3) {
          const cleanPlayer = jucator.trim().toUpperCase();
          const exists = await redis.zscore(`team:${teamId}:membri`, cleanPlayer);
          if (exists === null) {
             await redis.zadd(`team:${teamId}:membri`, 0, cleanPlayer);
          }
        }
        
        const membriRaw = await redis.zrevrange(`team:${teamId}:membri`, 0, 14, 'WITHSCORES');
        const formattedTop = [];
        for (let i = 0; i < membriRaw.length; i += 2) {
          formattedTop.push({ member: membriRaw[i], score: parseInt(membriRaw[i+1]) || 0 });
        }
        
        return NextResponse.json({ success: true, details: { id: teamId, nume: teamName, ...teamStats }, top: formattedTop });
      }

      case 'creeaza-echipa': {
        if (!creator || creator.trim().length < 3) return NextResponse.json({ success: false });
        const newId = `grup_${Math.random().toString(36).substring(2, 9)}`;
        const cleanCreator = creator.trim().toUpperCase();
        const finalTeamName = `GRUPUL LUI ${cleanCreator}`;
        
        const pipeline = redis.pipeline();
        pipeline.set(`team:${newId}:nume`, finalTeamName);
        pipeline.hset(`team:${newId}:stats`, { creator: cleanCreator, victorii: 0, creat_la: Date.now() });
        // Scorul pornește de la ZERO curat
        pipeline.zadd(`team:${newId}:membri`, 0, cleanCreator); 
        await pipeline.exec();
        
        return NextResponse.json({ success: true, teamId: newId });
      }

      case 'redenumeste-echipa': {
        if (teamId && newName && newName.trim().length >= 3) {
          await redis.set(`team:${teamId}:nume`, newName.toUpperCase().trim());
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false });
      }

      case 'creeaza-camera-privata': {
        const codPIN = Math.floor(1000 + Math.random() * 9000).toString();
        await redis.setex(`room:${codPIN}`, 3600, JSON.stringify({ creator, t: Date.now() }));
        return NextResponse.json({ success: true, cod: codPIN });
      }

      default:
        return NextResponse.json({ success: false, error: "Acțiune necunoscută" }, { status: 400 });
    }
  } catch (error) {
    console.error("[API Error]:", error);
    return NextResponse.json({ success: false, error: "Eroare internă" }, { status: 500 });
  }
}