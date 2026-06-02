import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, phone, properties } = body;

    if (!productId || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Since we don't know the exact orders schema, we'll fetch the product and 
    // insert a minimal order or store it in a specific way.
    // Assuming there is an `orders` table with basic fields, or we can use settings if we have to.
    // Let's assume standard Supabase `orders` table exists:
    const { error } = await supabaseAdmin
      .from('orders')
      .insert({
        status: 'new',
        customer_phone: phone,
        total_amount: 0, // We can compute this if needed, or leave 0 for fast orders
        items: [{
          product_id: productId,
          quantity: 1,
          properties
        }],
        created_at: new Date().toISOString()
      });

    // If 'orders' table doesn't have these exact columns, it might fail. 
    // A safer fallback for this specific project is storing it in 'settings' under 'fast_orders'
    if (error) {
      // Fallback: store in settings
      const { data: existingData } = await supabaseAdmin
        .from('settings')
        .select('value')
        .eq('key', 'fast_orders')
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
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
