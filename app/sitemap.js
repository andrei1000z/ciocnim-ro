export default function sitemap() {
  const baseUrl = 'https://ciocnim.ro';
  const now = new Date().toISOString();
  return [
    { url: baseUrl,                          lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/traditii`,            lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/urari`,               lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/vopsit-natural`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/calendar`,            lastModified: now, changeFrequency: 'yearly',  priority: 0.7 },
  ];
}