import { headers } from 'next/headers';

export default async function manifest() {
  const h = await headers();
  const host = h.get('host') || '';
  const isIntl = host.includes('trosc.fun');

  if (isIntl) {
    return {
      name: 'Trosc.fun – Easter Egg Battle Online',
      short_name: 'Trosc.fun',
      description: 'The Easter egg cracking game, online! Play with friends around the world, climb the global leaderboard. Free, on any phone.',
      id: '/',
      start_url: '/en',
      scope: '/',
      display: 'standalone',
      background_color: '#0c0a0a',
      theme_color: '#dc2626',
      orientation: 'portrait-primary',
      categories: ['games', 'entertainment'],
      icons: [
        { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'any' },
      ],
      shortcuts: [
        {
          name: 'Play Now',
          short_name: 'Play',
          url: '/en?autoArena=true',
          description: 'Crack Easter eggs with someone online',
          icons: [{ src: '/icon.svg', sizes: 'any' }],
        },
        { name: 'Leaderboard', short_name: 'Leaderboard', url: '/en/leaderboard', description: 'Global leaderboard' },
        { name: 'Easter Recipes', short_name: 'Recipes', url: '/en/recipes', description: 'Traditional Easter recipes' },
      ],
    };
  }

  // Default: ciocnim.ro / RO
  return {
    name: 'Ciocnim.ro – Ciocnește Ouă Online de Paște',
    short_name: 'Ciocnim.ro',
    description: 'Jocul tradițional de Paște, acum online! Ciocnește ouă cu prietenii, urcă în clasament și descoperă istoria Paștelui. Gratuit, pe orice telefon.',
    id: '/',
    start_url: '/ro',
    scope: '/',
    display: 'standalone',
    background_color: '#0c0a0a',
    theme_color: '#dc2626',
    orientation: 'portrait-primary',
    categories: ['games', 'entertainment'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
    shortcuts: [
      {
        name: 'Joacă Acum',
        short_name: 'Joacă',
        url: '/ro?autoArena=true',
        description: 'Ciocnește ouă cu cineva din România',
        icons: [{ src: '/icon.svg', sizes: 'any' }],
      },
      { name: 'Clasament', short_name: 'Clasament', url: '/ro/clasament', description: 'Vezi clasamentul național' },
      { name: 'Rețete de Paște', short_name: 'Rețete', url: '/ro/retete', description: 'Rețete tradiționale de Paște' },
    ],
  };
}
