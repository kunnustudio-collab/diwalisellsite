import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductByIdOrSlug, getProducts, getSiteSettings } from '@/lib/db';
import { ProductDetailClient } from '@/components/products/ProductDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductByIdOrSlug(params.id);
  if (!product) {
    return {
      title: 'Product Not Found — DeepAura',
    };
  }

  return {
    title: `${product.name} — DeepAura Diwali Decor`,
    description: product.short_description || product.description,
    openGraph: {
      title: `${product.name} — DeepAura Diwali Decor`,
      description: product.short_description || product.description,
      images: [{ url: product.image_url }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const [product, allProducts, settings] = await Promise.all([
    getProductByIdOrSlug(params.id),
    getProducts({ activeOnly: true }),
    getSiteSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
      settings={settings}
    />
  );
}
