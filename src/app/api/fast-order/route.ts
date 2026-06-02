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

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
