import Pusher from 'pusher';

// CRITICAL: cluster 'eu' MUST match client-side `cluster: 'eu'` in ClientWrapper.
// Fără cluster, Pusher server SDK folosește api.pusherapp.com (mt1 default),
// iar events sunt trimise la wrong cluster → clienții din eu nu le primesc.
// Descoperit via Playwright deep debug: channel.subscribed=true, _join bound,
// server returns success, dar Events captured = 0 peste 5s.
const pusherConfig = {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'eu',
  useTLS: true,
};
// Doar pentru dev self-hosted (soketi) override host+port
if (process.env.PUSHER_HOST) {
  pusherConfig.host = process.env.PUSHER_HOST;
  pusherConfig.port = parseInt(process.env.PUSHER_PORT || '6443');
}
const pusher = new Pusher(pusherConfig);

export default pusher;
