export default function sitemap() {
  const baseUrl = 'https://ciocnim.ro';
  return [
    { url: baseUrl,                          lastModified: new Date('2026-03-30'), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/traditii`,            lastModified: new Date('2026-03-28'), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/urari`,               lastModified: new Date('2026-03-28'), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/retete`,              lastModified: new Date('2026-03-28'), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/clasament`,           lastModified: new Date('2026-03-30'), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/vopsit-natural`,      lastModified: new Date('2026-03-28'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/ghid`,               lastModified: new Date('2026-03-28'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/despre`,              lastModified: new Date('2026-03-17'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/calendar`,            lastModified: new Date('2026-03-28'), changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${baseUrl}/privacy`,             lastModified: new Date('2026-03-01'), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/terms`,              lastModified: new Date('2026-03-01'), changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
