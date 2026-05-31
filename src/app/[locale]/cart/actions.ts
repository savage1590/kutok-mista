"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface OrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerComment?: string;
  shippingAddress: string;
  paymentMethod: string;
  items: {
    productId: string;
    quantity: number;
    selectedProperties: any;
  }[];
}

export async function processOrder(orderData: OrderData) {
  try {
    const { items, customerName, customerEmail, customerPhone, customerComment, shippingAddress, paymentMethod } = orderData;

    if (!items || items.length === 0) {
      return { success: false, error: "Кошик порожній" };
    }

    // 1. Fetch real prices for all products
    const productIds = items.map(item => item.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, price')
      .in('id', productIds);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return { success: false, error: "Помилка при перевірці товарів" };
    }

    // Create a price map for quick lookup
    const priceMap = new Map(products?.map(p => [p.id, p.price]) || []);

    // 2. Calculate the secure total amount
    let totalAmount = 0;
    const orderItemsToInsert = items.map(item => {
      const price = priceMap.get(item.productId) || 0;
      totalAmount += price * item.quantity;
      
      return {
        product_id: item.productId,
        quantity: item.quantity,
        price_at_time: price,
        selected_properties: item.selectedProperties
      };
    });

    if (totalAmount <= 0) {
      return { success: false, error: "Сума замовлення не може бути 0" };
    }

    // Map payment methods to existing DB constraints (if user hasn't updated them yet)
    let dbPaymentMethod = 'cash';
    if (paymentMethod === 'full_payment' || paymentMethod === 'monopay' || paymentMethod === 'liqpay') {
      dbPaymentMethod = paymentMethod === 'full_payment' ? 'monopay' : paymentMethod;
    }

    // 3. Insert into orders table
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_comment: customerComment || null,
        shipping_address: shippingAddress,
        total_amount: totalAmount,
        payment_method: dbPaymentMethod,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return { success: false, error: "Помилка при створенні замовлення" };
    }

    // 4. Attach order_id to items and insert
    const finalOrderItems = orderItemsToInsert.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(finalOrderItems);

    if (itemsError) {
      console.error("Error inserting order items:", itemsError);
      // In a real app we might want to rollback the order creation here, 
      // but for now we just return the error.
      return { success: false, error: "Помилка при додаванні товарів у замовлення" };
    }

    // 5. Send Telegram Notification
    try {
      const botToken = "8934355636:AAFcNT63FcEwRMoPxrK_fuGY9HOU9apcVf8";
      const groupId = "-1003945954990";
      const text = `📦 НОВЕ ЗАМОВЛЕННЯ #${order.id.slice(0, 8)}!\n\n👤 Клієнт: ${customerName}\n📞 Телефон: ${customerPhone}\n✉️ Email: ${customerEmail}\n📍 Доставка: ${shippingAddress}\n💰 Сума: ${totalAmount} ₴\n💳 Оплата: ${paymentMethod}${customerComment ? `\n💬 Коментар: ${customerComment}` : ''}`;
      
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: groupId, text })
      });
      
      if (!tgRes.ok) {
        const errText = await tgRes.text();
        console.error("Telegram API error:", errText);
      }
    } catch (err) {
      console.error("Failed to send telegram notification", err);
    }

    // 6. Generate LiqPay Payload if needed
    if (paymentMethod === 'liqpay') {
      const crypto = require('crypto');
      const publicKey = process.env.LIQPAY_PUBLIC_KEY || '';
      const privateKey = process.env.LIQPAY_PRIVATE_KEY || '';
      
      const liqpayParams = {
        public_key: publicKey,
        version: 3,
        action: "pay",
        amount: totalAmount,
        currency: "UAH",
        description: `Оплата замовлення #${order.id.slice(0, 8)}`,
        order_id: order.id,
        // The server URL where LiqPay will send the callback:
        server_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://savage1590.github.io'}/api/payment/liqpay-callback`,
        // Where user returns after payment:
        result_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://savage1590.github.io'}/thank-you?order_id=${order.id}`
      };

      const dataBase64 = Buffer.from(JSON.stringify(liqpayParams)).toString('base64');
      const signature = crypto.createHash('sha1').update(privateKey + dataBase64 + privateKey).digest('base64');

      return { 
        success: true, 
        orderId: order.id,
        liqpayData: { data: dataBase64, signature }
      };
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Order processing failed:", error);
    return { success: false, error: "Невідома помилка" };
  }
}
