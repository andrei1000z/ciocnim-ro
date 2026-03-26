export default function sitemap() {
  const baseUrl = 'https://ciocnim.ro';
  const lastBuild = new Date();
  return [
    { url: baseUrl,                          lastModified: lastBuild, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/traditii`,            lastModified: lastBuild, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/urari`,               lastModified: lastBuild, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/retete`,              lastModified: lastBuild, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/clasament`,           lastModified: lastBuild, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/vopsit-natural`,      lastModified: lastBuild, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/ghid`,               lastModified: lastBuild, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/despre`,              lastModified: lastBuild, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/calendar`,            lastModified: lastBuild, changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${baseUrl}/privacy`,             lastModified: lastBuild, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/terms`,              lastModified: lastBuild, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
