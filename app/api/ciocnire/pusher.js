import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  host: process.env.PUSHER_HOST,
  port: parseInt(process.env.PUSHER_PORT || '6443'),
  useTLS: true,
});

export default pusher;
