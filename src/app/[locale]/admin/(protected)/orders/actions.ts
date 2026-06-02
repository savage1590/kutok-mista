"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function getOrders() {
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      order_items (
        *,
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  // Map product_images to a single image_url for the client
  return orders?.map(order => ({
    ...order,
    order_items: order.order_items?.map((item: any) => {
      const product = item.product;
      const images = product?.product_images || [];
      const primaryImage = images.find((img: any) => img.is_primary) || images[0];
      
      return {
        ...item,
        product: {
          ...product,
          image_url: primaryImage?.image_url || null
        }
      };
    })
  })) || [];
}

export async function updateOrderStatus(orderId: string, status: string, paymentStatus: string) {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ 
      status,
      payment_status: paymentStatus
    })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order:", error);
    return { success: false, error: "Помилка при оновленні замовлення" };
  }

  revalidatePath("/[locale]/admin/orders", "page");
  return { success: true };
}

export async function getFastOrders() {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "fast_orders")
    .single();
  
  return (data?.value as any[]) || [];
}

export async function updateFastOrderStatus(orderId: string, status: string) {
  const fastOrders = await getFastOrders();
  const updated = fastOrders.map(o => o.id === orderId ? { ...o, status } : o);
  
  const { error } = await supabaseAdmin
    .from("settings")
    .upsert({ key: "fast_orders", value: updated });
    
  if (error) return { success: false, error: error.message };
  revalidatePath("/[locale]/admin/orders", "page");
  return { success: true };
}

export async function deleteFastOrder(orderId: string) {
  const fastOrders = await getFastOrders();
  const updated = fastOrders.filter(o => o.id !== orderId);
  
  const { error } = await supabaseAdmin
    .from("settings")
    .upsert({ key: "fast_orders", value: updated });
    
  if (error) return { success: false, error: error.message };
  revalidatePath("/[locale]/admin/orders", "page");
  return { success: true };
}
