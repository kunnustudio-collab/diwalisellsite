import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'DeepAura — Premium Diwali Decoration & Festive Lighting',
  description:
    'Shop authentic handcrafted brass diyas, luminous fairy string lights, royal entrance torans, and luxury Diwali hampers across India.',
  keywords: [
    'Diwali decoration',
    'brass diya',
    'fairy lights',
    'toran',
    'rangoli kit',
    'puja thali',
    'festive lights',
    'DeepAura',
  ],
  authors: [{ name: 'DeepAura Diwali Decor' }],
  openGraph: {
    title: 'DeepAura — Premium Diwali Decoration',
    description: 'Light up every corner of your celebration with handcrafted festive decor.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'DeepAura',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FFFEFA] text-stone-900 antialiased selection:bg-gold-500 selection:text-maroon-950">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
