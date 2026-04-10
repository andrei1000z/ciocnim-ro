import { headers } from 'next/headers';

export default async function manifest() {
  const h = await headers();
  const host = h.get('host') || '';
  const isIntl = host.includes('trosc.fun');

  if (isIntl) {
    return {
      name: 'Trosc.fun – Чукай Яйца Онлайн за Великден',
      short_name: 'Trosc.fun',
      description: 'Великденската игра онлайн! Чукай яйца с приятели, качвай се в класацията. Безплатно, на всеки телефон.',
      id: '/',
      start_url: '/bg',
      scope: '/',
      display: 'standalone',
      background_color: '#0c0a0a',
      theme_color: '#dc2626',
      orientation: 'portrait-primary',
      categories: ['games', 'entertainment'],
      icons: [
        { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
        { src: '/icon-512x512.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
      shortcuts: [
        {
          name: 'Играй Сега',
          short_name: 'Играй',
          url: '/bg?autoArena=true',
          description: 'Чукай яйца с някого от България',
          icons: [{ src: '/apple-touch-icon.png', sizes: '180x180' }],
        },
        { name: 'Класация', short_name: 'Класация', url: '/bg/clasament', description: 'Виж националната класация' },
        { name: 'Великденски Рецепти', short_name: 'Рецепти', url: '/bg/retete', description: 'Традиционни великденски рецепти' },
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
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
      { src: '/icon-512x512.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
    shortcuts: [
      {
        name: 'Joacă Acum',
        short_name: 'Joacă',
        url: '/ro?autoArena=true',
        description: 'Ciocnește ouă cu cineva din România',
        icons: [{ src: '/apple-touch-icon.png', sizes: '180x180' }],
      },
      { name: 'Clasament', short_name: 'Clasament', url: '/ro/clasament', description: 'Vezi clasamentul național' },
      { name: 'Rețete de Paște', short_name: 'Rețete', url: '/ro/retete', description: 'Rețete tradiționale de Paște' },
    ],
  };
}
