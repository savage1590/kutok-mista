"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";
import * as React from "react";
import OrderConfirmationEmail from "@/components/emails/OrderConfirmationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
export interface OrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerComment?: string;
  shippingAddress: string;
  paymentMethod: string;
  promoCode?: string;
  items: {
    productId: string;
    quantity: number;
    selectedProperties: any;
  }[];
}

export async function processOrder(orderData: OrderData) {
  try {
    const { items, customerName, customerEmail, customerPhone, customerComment, shippingAddress, paymentMethod, promoCode } = orderData;

    if (!items || items.length === 0) {
      return { success: false, error: "Кошик порожній" };
    }

    // 1. Fetch real prices and names for all products
    const productIds = items.map(item => item.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, price, name_ua')
      .in('id', productIds);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return { success: false, error: "Помилка при перевірці товарів" };
    }

    // Create maps for quick lookup
    const priceMap = new Map(products?.map(p => [p.id, p.price]) || []);
    const nameMap = new Map(products?.map(p => [p.id, p.name_ua]) || []);

    // 2. Calculate the secure subtotal amount
    let subtotal = 0;
    const emailItems: any[] = [];

    const orderItemsToInsert = items.map(item => {
      const price = priceMap.get(item.productId) || 0;
      const name = nameMap.get(item.productId) || 'Товар';
      
      subtotal += price * item.quantity;
      
      emailItems.push({
        name: name,
        quantity: item.quantity,
        price: price
      });

      return {
        product_id: item.productId,
        quantity: item.quantity,
        price_at_time: price,
        selected_properties: item.selectedProperties
      };
    });

    if (subtotal <= 0) {
      return { success: false, error: "Сума замовлення не може бути 0" };
    }

    // 2.5 Process Promo Code
    let discountAmount = 0;
    let validPromoCode: string | null = null;
    
    if (promoCode) {
      const { data: promo } = await supabaseAdmin
        .from('promo_codes')
        .select('*')
        .ilike('code', promoCode.trim())
        .single();
        
      if (promo && promo.is_active) {
        const now = new Date();
        const validFrom = promo.valid_from ? new Date(promo.valid_from) : null;
        const validUntil = promo.valid_until ? new Date(promo.valid_until) : null;
        
        const isStarted = !validFrom || validFrom <= now;
        const isNotExpired = !validUntil || validUntil >= now;
        const hasUsesLeft = promo.max_uses === null || promo.used_count < promo.max_uses;
        
        if (isStarted && isNotExpired && hasUsesLeft) {
          validPromoCode = promo.code;
          if (promo.discount_type === 'percentage') {
            discountAmount = Math.round(subtotal * (Number(promo.discount_value) / 100));
          } else {
            discountAmount = Number(promo.discount_value);
          }
        }
      }
    }
    
    discountAmount = Math.min(discountAmount, subtotal);
    const totalAmount = subtotal - discountAmount;

    // Map payment methods to existing DB constraints (if user hasn't updated them yet)
    let dbPaymentMethod = 'cash';
    if (paymentMethod === 'full_payment' || paymentMethod === 'monopay' || paymentMethod === 'liqpay') {
      dbPaymentMethod = paymentMethod === 'full_payment' ? 'monopay' : paymentMethod;
    }

    // Generate random 6-digit order number
    const generateOrderNumber = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };
    
    const orderNumber = generateOrderNumber();

    // 3. Insert into orders table
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_comment: customerComment || null,
        shipping_address: shippingAddress,
        total_amount: totalAmount,
        subtotal: subtotal,
        promo_code: validPromoCode,
        discount_amount: discountAmount,
        payment_method: dbPaymentMethod,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return { success: false, error: "Помилка при створенні замовлення" };
    }
    
    // Update promo code usage count if used
    if (validPromoCode) {
      try {
        const { error: rpcError } = await supabaseAdmin.rpc('increment_promo_usage', { promo_code: validPromoCode });
        if (rpcError) throw rpcError;
      } catch (err) {
        // Fallback if rpc is not created: manually fetch and update (less safe for concurrency, but works)
        const { data } = await supabaseAdmin.from('promo_codes').select('used_count').eq('code', validPromoCode).single();
        if (data) {
          await supabaseAdmin.from('promo_codes').update({ used_count: data.used_count + 1 }).eq('code', validPromoCode);
        }
      }
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
      const text = `📦 НОВЕ ЗАМОВЛЕННЯ #${order.order_number}!\n\n👤 Клієнт: ${customerName}\n📞 Телефон: ${customerPhone}\n✉️ Email: ${customerEmail}\n📍 Доставка: ${shippingAddress}\n💰 Сума: ${totalAmount} ₴\n💳 Оплата: ${paymentMethod}${customerComment ? `\n💬 Коментар: ${customerComment}` : ''}`;
      
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

    // 6. Send Email Notification
    try {
      const emailResponse = await resend.emails.send({
        from: 'Kutok Mista <info@kutok-mista.com.ua>',
        to: [customerEmail], // Send to customer
        bcc: ['info@kutok-mista.com.ua'], // Send copy to admin
        subject: `Дякуємо за замовлення #${orderNumber} | Kutok Mista`,
        react: OrderConfirmationEmail({
          orderNumber: orderNumber,
          customerName: customerName,
          totalAmount: totalAmount,
          shippingAddress: shippingAddress,
          paymentMethod: dbPaymentMethod,
          items: emailItems,
        }) as React.ReactElement,
      });
      
      console.log('=== RESEND RESPONSE ===', JSON.stringify(emailResponse, null, 2));
      
      if (emailResponse.error) {
        console.error('Resend returned an error:', emailResponse.error);
      }
    } catch (err) {
      console.error("Failed to send email notification exception:", err);
    }

    // 7. Generate LiqPay Payload if needed
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
        description: `Оплата замовлення #${order.order_number}`,
        order_id: order.id,
        // API route that LiqPay will call in the background to update order status:
        server_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.kutok-mista.com.ua'}/api/payment/liqpay-callback`,
        // Where user returns after payment:
        result_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.kutok-mista.com.ua'}/thank-you?order_num=${orderNumber}`
      };

      const dataBase64 = Buffer.from(JSON.stringify(liqpayParams)).toString('base64');
      const signature = crypto.createHash('sha1').update(privateKey + dataBase64 + privateKey).digest('base64');

      return { 
        success: true, 
        orderId: order.id,
        orderNumber: order.order_number,
        liqpayData: { data: dataBase64, signature }
      };
    }

    return { success: true, orderId: order.id, orderNumber: order.order_number };
  } catch (error) {
    console.error("Order processing failed:", error);
    return { success: false, error: "Невідома помилка" };
  }
}
