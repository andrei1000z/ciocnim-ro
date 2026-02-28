import Pusher from "pusher";
import { NextResponse } from "next/server";

// Aici ne conectăm la Pusher cu parolele din .env.local
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(req) {
  const body = await req.json();
  const { roomId, jucatorCareDa } = body;

  // Magia: 50% șanse să câștige cel care a dat cu oul, 50% să se spargă al lui
  const castigaCelCareDa = Math.random() < 0.5;

  // Trimitem rezultatul instant pe telefoanele celor doi jucători
  await pusher.trigger(`camera-${roomId}`, "rezultat", {
    castigaCelCareDa,
    jucatorCareDa
  });

  return NextResponse.json({ success: true });
}