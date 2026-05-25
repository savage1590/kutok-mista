"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getStatistics(period: "7days" | "30days" | "month" | "all") {
  // Determine date range
  let startDate = new Date();
  if (period === "7days") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === "30days") {
    startDate.setDate(startDate.getDate() - 30);
  } else if (period === "month") {
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  } else {
    startDate = new Date(0); // Epoch
  }

  const startDateIso = startDate.toISOString();

  // Fetch orders
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      created_at,
      total_amount,
      status,
      payment_status,
      order_items (
        quantity,
        product_id,
        price_at_time,
        product:product_id (
          name_ua,
          name_en,
          product_images (
            image_url,
            is_primary
          )
        )
      )
    `)
    .gte("created_at", startDateIso)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching statistics:", error);
    return null;
  }

  // Calculate KPIs
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalItemsSold = 0;
  
  // Status Distribution
  const statusCounts: Record<string, number> = {
    new: 0,
    processing: 0,
    paid: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
  };

  // Top products aggregation
  const productsMap: Record<string, any> = {};

  // Daily revenue aggregation
  const dailyRevenue: Record<string, { date: string, revenue: number, orders: number }> = {};

  orders.forEach((order: any) => {
    // We count it as an order regardless, but for revenue/items we check if it's successful
    const isSuccessful = order.status === "completed" || order.payment_status === "paid" || order.status === "shipped";
    
    // Status counts
    if (statusCounts[order.status] !== undefined) {
      statusCounts[order.status]++;
    } else {
      statusCounts[order.status] = 1;
    }

    // Daily aggregation
    const dateStr = new Date(order.created_at).toISOString().split('T')[0];
    if (!dailyRevenue[dateStr]) {
      dailyRevenue[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }
    
    dailyRevenue[dateStr].orders++;

    // Process only successful orders for revenue & items
    if (isSuccessful) {
      totalRevenue += order.total_amount;
      totalOrders++;
      dailyRevenue[dateStr].revenue += order.total_amount;

      // Items
      order.order_items?.forEach((item: any) => {
        totalItemsSold += item.quantity;
        
        // Product stats
        if (!productsMap[item.product_id]) {
          const product = item.product;
          const images = product?.product_images || [];
          const primaryImage = images.find((img: any) => img.is_primary) || images[0];
          
          productsMap[item.product_id] = {
            id: item.product_id,
            name: product?.name_ua || "Невідомий товар",
            image_url: primaryImage?.image_url || null,
            quantitySold: 0,
            revenue: 0
          };
        }
        
        productsMap[item.product_id].quantitySold += item.quantity;
        productsMap[item.product_id].revenue += (item.quantity * item.price_at_time);
      });
    }
  });

  const averageCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  
  // Format for charts
  const chartData = Object.values(dailyRevenue).sort((a, b) => a.date.localeCompare(b.date));
  
  const statusData = [
    { name: 'Нові', value: statusCounts.new || 0, color: '#3B82F6' },
    { name: 'В обробці', value: statusCounts.processing || 0, color: '#A855F7' },
    { name: 'Оплачені', value: statusCounts.paid || 0, color: '#10B981' },
    { name: 'Відправлені', value: statusCounts.shipped || 0, color: '#F59E0B' },
    { name: 'Виконані', value: statusCounts.completed || 0, color: '#22C55E' },
    { name: 'Скасовані', value: statusCounts.cancelled || 0, color: '#EF4444' },
  ].filter(s => s.value > 0);

  const topProducts = Object.values(productsMap)
    .sort((a: any, b: any) => b.quantitySold - a.quantitySold)
    .slice(0, 10);

  // Raw orders for Excel export (optional)
  const rawOrdersForExport = orders.map((o: any) => ({
    id: o.id,
    date: new Date(o.created_at).toLocaleString('uk-UA'),
    total_amount: o.total_amount,
    status: o.status,
    payment_status: o.payment_status
  }));

  return {
    kpi: {
      totalRevenue,
      totalOrders,
      averageCheck,
      totalItemsSold
    },
    chartData,
    statusData,
    topProducts,
    rawOrdersForExport
  };
}
