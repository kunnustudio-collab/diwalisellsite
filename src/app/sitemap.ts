import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deepaura.com';

  const products = await getProducts({ activeOnly: true });

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug || p.id}`,
    lastModified: new Date(p.updated_at || p.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/order-status`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...productUrls,
  ];
}
