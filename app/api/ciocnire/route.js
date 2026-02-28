import Pusher from "pusher";
import { NextResponse } from "next/server";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(req) {
  const body = await req.json();
  const { roomId, actiune, jucator } = body;

  if (actiune === 'lovitura') {
    const castigaCelCareDa = Math.random() < 0.5;
    await pusher.trigger(`camera-${roomId}`, 'lovitura', { ...body, castigaCelCareDa });
    
    // Anunțăm tot site-ul că s-a spart un ou pe bune!
    await pusher.trigger('global', 'ou-spart', {});
  } 
  else if (actiune === 'paraseste') {
    await pusher.trigger(`camera-${roomId}`, 'adversar-iesit', {});
  }
  else if (actiune === 'cauta-random') {
    // Trimitem semnal pe un canal general de LOBBY
    await pusher.trigger('lobby', 'camera-disponibila', { roomId, jucator });
  } 
  else {
    await pusher.trigger(`camera-${roomId}`, actiune, body);
  }

  return NextResponse.json({ success: true });
}