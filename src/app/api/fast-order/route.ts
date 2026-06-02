import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, phone, properties } = body;

    if (!productId || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: existingData } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'fast_orders')
      .single();
      
    // Fetch product to get name for telegram
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('name_ua')
      .eq('id', productId)
      .single();
      
    const existingOrders = (existingData?.value as any[]) || [];
    const newOrder = {
      id: Date.now().toString(),
      productId,
      phone,
      properties,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    
    await supabaseAdmin
      .from('settings')
      .upsert({ key: 'fast_orders', value: [newOrder, ...existingOrders] });

    // Send Telegram Notification
    try {
      const botToken = "8934355636:AAFcNT63FcEwRMoPxrK_fuGY9HOU9apcVf8";
      const groupId = "-1003945954990";
      const productName = product?.name_ua || productId;
      
      let propertiesText = "";
      if (properties && Object.keys(properties).length > 0) {
        propertiesText = "\nПараметри: " + Object.entries(properties).map(([k, v]) => `${k}: ${v}`).join(', ');
      }

      const text = `⚡ ЗАМОВЛЕННЯ В 1 КЛІК!\n\n📞 Телефон: ${phone}\n🛍 Товар: ${productName}${propertiesText}`;
      
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: groupId, text })
      });
    } catch (err) {
      console.error("Failed to send telegram notification", err);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
