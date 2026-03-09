# 🥚 Ciocnim.ro - Setup & Functionality Guide

## 📱 Project Overview

**Ciocnim.ro** is a modern, tradition-respecting online Easter egg-cracking game that works seamlessly on both web browsers and mobile devices. Players can crack virtual eggs, compete in national leaderboards, challenge friends in private groups, and learn about Romanian Easter traditions.

### Design Philosophy
- **Modern + Traditional**: Contemporary web design respecting Romanian Easter (Paștele) traditions
- **Mobile-First**: Optimized for all devices from 320px (small phones) to 2560px+ (desktop)
- **Warm Aesthetic**: Gradient backgrounds (amber → orange → red) representing Easter warmth
- **Traditional Colors**:
  - Primary Red: #dc2626 (traditional egg color)
  - Gold/Chihlimbar: #d97706 (warm, festive)
  - Light Background: Soft amber/orange tones

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ and npm
- Internet connection (for Pusher & Redis)
- Modern web browser or mobile device

### Installation & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

3. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

---

## 📋 Environment Variables

The `.env.local` file contains:
```
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
PUSH ER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret
REDIS_URL=your_redis_connection_url
```

These are pre-configured for the project. No changes needed unless updating services.

---

## 📱 Pages & Features

### Home Page (`/`)
- **Profile Management**: Set player nickname and choose egg color/region
- **Leaderboards**: View top players nationally and by region
- **Game Modes**:
  - 🌍 National Arena: Match with random players
  - 👥 Private Groups: Create/join family/friend groups
  - ⚔️ Private Match: Direct duel with a friend
- **Statistics**: Track wins/losses locally

### Game Arena (`/joc/[room]`)
- **Real-time Multiplayer**: Live egg-cracking battles
- **Mechanics**: Click/tap to crack eggs, winner determined by random angle
- **Chat**: In-game messaging to taunt friends
- **Score Sync**: Real-time leaderboard updates via Pusher
- **Mobile Optimized**: Touch-friendly, responsive arena

### Traditions Pages
- **Tradiții** (`/traditii`): History, rules, and meaning of egg-cracking
- **Vopsit Natural** (`/vopsit-natural`): How to dye eggs naturally with onion skins
- **Urări** (`/urari`): Traditional Easter wishes and greetings
- **Calendar** (`/calendar`): Easter dates for 2026-2030

---

## 💻 Mobile Experience

### Features
✅ **Responsive Design**: Automatically adapts from 320px to desktop  
✅ **Touch Optimized**: Large tap targets, no tap delays  
✅ **Safe Area Support**: Works with iPhone notches & dynamic islands  
✅ **No Zoom on Input**: 16px font prevents iOS zoom on focus  
✅ **100dvh Support**: Works correctly on mobile browsers with address bar  
✅ **Offline Capable**: Local storage for player data  
✅ **Fast Performance**: Code-split pages, optimized images  

### Testing on Mobile
1. **Local Network Testing**:
   - Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - On mobile, visit: `http://YOUR_IP:3000`

2. **Chrome DevTools Emulation**:
   - Open DevTools (F12)
   - Toggle Device Toolbar (Ctrl+Shift+M)
   - Test various device sizes

3. **Real Device**:
   - Use phone hotspot connected to dev PC
   - Visit `http://192.168.x.x:3000` from mobile browser

---

## 🎮 Game Mechanics

### How to Play
1. **Set your nickname** and choose egg color (Red, Blue, Gold, Green, Violet)
2. **Select your region** from 9 historic Romanian regions
3. **Join a game mode**:
   - National Arena: Automatic matchmaking
   - Private Group: Invite friends via unique link
   - Friend Duel: Challenge by username

4. **Win by cracking eggs**: Click/tap rapidly to crack the opponent's egg
5. **Score updates**: Win counter increases in real-time
6. **National ranking**: Compete on regional and national leaderboards

### Scoring
- **Victory**: +1 point per win
- **Regions**: Point accumulation by region
- **Top 10**: Featured on national leaderboard
- **Persistence**: Scores saved to Redis database

---

## 🛠️ Development

### File Structure
```
app/
├── page.js              # Home page & main hub
├── layout.js            # Root layout with metadata
├── globals.css          # Global styles + animations
├── api/
│   └── ciocnire/
│       └── route.js     # Game API endpoints
├── joc/
│   └── [room]/
│       └── page.js      # Game arena page
├── components/
│   └── ClientWrapper.js # Global state & Pusher sync
├── lib/
│   └── redis.js         # Redis database connection
└── [traditions pages]   # traditii, vopsit-natural, urari, calendar
```

### Key Technologies
- **Next.js 16**: Server-side rendering & API routes
- **React 19**: UI components with hooks
- **Tailwind CSS 4**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Pusher**: Real-time multiplayer sync
- **Redis**: Persistent leaderboards & game state
- **ioredis**: Node.js Redis client with auto-pipelining

### CSS Classes

#### Animations
- `.animate-float-v9` - Gentle floating egg
- `.animate-impact` - Impact shake
- `.animate-pop` - Egg crack pop
- `.animate-glow` - Pulsing glow
- `.animate-star` - Twinkling star

#### Responsive
- `.px-mobile-fix` - Mobile-safe horizontal padding
- `.pb-safe` - Safe bottom padding for notches
- `@media (max-width: 380px)` - Extra-small screens

#### Colors
- `bg-gradient-to-br from-amber-50 via-orange-50 to-red-50` - Main background
- `text-red-700` / `text-orange-600` - Warm text colors
- `border-red-500` / `border-amber-400` - Easter colors

---

## 🔧 Customization

### Color Scheme
Edit CSS variables in `globals.css`:
```css
:root {
  --red-primary: #dc2626;
  --gold-primary: #d97706;
  --red-dark: #991b1b;
}
```

### Animations
Adjust keyframe durations in `globals.css`:
```css
@keyframes float-gentle {
  /* Modify animation timing */
}
```

### Regional Data
Edit regions in `page.js`:
```javascript
const REGIUNI_ISTORICE = [
  "Transilvania", "Moldova", "Muntenia", // ...
];
```

---

## 🐛 Troubleshooting

### Server won't start
- Check Node.js version: `node --version` (need 18.17+)
- Check Redis: Ensure `REDIS_URL` in `.env.local` is valid
- Check Pusher: Verify `NEXT_PUBLIC_PUSHER_KEY` is set

### App looks broken on mobile
- Clear browser cache: Ctrl+Shift+Delete
- Make sure viewport meta tag is present
- Check device orientation (try both portrait & landscape)

### Real-time updates not working
- Verify Pusher account is active and credentials correct
- Check browser WebSocket support
- Look for CORS errors in DevTools console

### Leaderboard not updating
- Check Redis connection in terminal (should say "connexité cu succes!")
- Verify API endpoint returns `200 OK`
- Check browser console for errors

---

## 📊 Performance Tips

### Optimization Already Done
✅ Code splitting by page  
✅ Image lazy loading ready  
✅ Tailwind CSS purging  
✅ React compiler enabled  
✅ Redis auto-pipelining  

### Further Optimization
- Use `next/image` for images
- Enable ISR (Incremental Static Regeneration)
- Add Service Worker for offline support
- Compress SVGs in game arena

---

## 🚀 Deployment

### To Vercel
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy (automatic on push to main)

### Self-Hosted
1. Build: `npm run build`
2. Start: `npm start`
3. Set up reverse proxy (nginx/Apache)
4. Configure environment variables
5. Use process manager (PM2) for auto-restart

---

## 📞 Support

For issues or questions:
- Check terminal for error messages
- Review browser DevTools console
- Verify all `.env.local` values
- Test with simple requests first

---

## 🎯 Next Steps

1. **Test on Mobile**: Open on actual phone, test all pages
2. **Play Games**: Try national arena, create a group, challenge friends
3. **Check Leaderboards**: Verify scores update in real-time
4. **Explore Traditions**: Read the Easter tradition pages
5. **Customize**: Change colors, add your own features

---

## ✨ Project Status

**Current Version**: V31.0 (Modern Light Theme + Mobile Perfect)

**Features Complete**:
- ✅ Full responsive design (320px - 2560px)
- ✅ Traditional Romanian Easter theme
- ✅ Real-time multiplayer (Pusher)
- ✅ National leaderboards (Redis)
- ✅ Mobile-optimized UI
- ✅ All pages functional
- ✅ Accessibility features

**Ready to Play!** 🥚🐔🌸

---

Made with ❤️ for Paștele Tradițional 2026

**Hristos a Înviat!**
