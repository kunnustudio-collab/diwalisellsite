import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getOrders, getProducts, getDatabase } from '@/lib/db';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const allOrders = await getOrders();
  const allProducts = await getProducts({ activeOnly: false });

  // 1. Order and Revenue metrics
  const totalOrders = allOrders.length;
  const confirmedOrders = allOrders.filter(
    (o) => o.order_status !== 'Cancelled' && o.order_status !== 'Refunded'
  );
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrders = allOrders.filter((o) => o.order_status === 'Pending').length;
  const deliveredOrders = allOrders.filter((o) => o.order_status === 'Delivered').length;

  // 2. Active & Low-stock products
  const activeProducts = allProducts.filter((p) => p.is_active);
  const lowStockProducts = allProducts.filter((p) => p.stock <= 20);

  // 3. Best performing products from actual order items
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number; image: string }> = {};

  allOrders.forEach((order) => {
    if (order.order_status === 'Cancelled' || order.order_status === 'Refunded') return;
    order.items?.forEach((item) => {
      if (!productSalesMap[item.product_id]) {
        productSalesMap[item.product_id] = {
          name: item.product_name,
          quantity: 0,
          revenue: 0,
          image: item.product_image,
        };
      }
      productSalesMap[item.product_id].quantity += item.quantity;
      productSalesMap[item.product_id].revenue += item.total_price;
    });
  });

  const topSelling = Object.entries(productSalesMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // 4. Daily sales breakdown for chart
  const salesByDate: Record<string, number> = {};
  confirmedOrders.forEach((o) => {
    const d = o.created_at.split('T')[0];
    salesByDate[d] = (salesByDate[d] || 0) + o.total_amount;
  });

  const chartData = Object.entries(salesByDate)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    metrics: {
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      activeProductsCount: activeProducts.length,
      maxActiveLimit: 10,
    },
    topSelling,
    lowStockProducts,
    recentOrders: allOrders.slice(0, 8),
    chartData,
  });
}
