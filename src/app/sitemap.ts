import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const base = 'https://scorius.app';

const routes = [
  '',
  '/features',
  '/support',
  '/privacy',
  '/terms',
  '/imprint',
  '/accessibility',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
