import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, authorName, text, rating } = body;

    if (!productId || !authorName || !text) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data: existingData } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'product_reviews')
      .single();
      
    const existingReviews = (existingData?.value as any[]) || [];
    const newReview = {
      id: Date.now().toString(),
      product_id: productId,
      author_name: authorName,
      text,
      rating: rating || 5,
      status: 'pending', // Requires admin approval
      created_at: new Date().toISOString()
    };
    
    await supabaseAdmin
      .from('settings')
      .upsert({ key: 'product_reviews', value: [newReview, ...existingReviews] });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
