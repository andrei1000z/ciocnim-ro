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
  const { roomId, actiune } = body;

  // Dacă cineva dă cu oul, serverul dă cu banul (50/50 șanse) să vedem cine câștigă
  if (actiune === 'lovitura') {
    const castigaCelCareDa = Math.random() < 0.5;
    await pusher.trigger(`camera-${roomId}`, 'lovitura', {
      ...body,
      castigaCelCareDa
    });
  } else {
    // Pentru celelalte acțiuni (alegerea oului, cererea de status), 
    // serverul doar trimite mesajul mai departe celuilalt telefon
    await pusher.trigger(`camera-${roomId}`, actiune, body);
  }

  return NextResponse.json({ success: true });
}