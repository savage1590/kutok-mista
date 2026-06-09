import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Код не вказано' }, { status: 400 });
    }

    const { data: promo, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .ilike('code', code.trim()) // case-insensitive exact match
      .single();

    if (error || !promo) {
      return NextResponse.json({ success: false, error: 'Промокод не знайдено' }, { status: 404 });
    }

    if (!promo.is_active) {
      return NextResponse.json({ success: false, error: 'Цей промокод більше не активний' }, { status: 400 });
    }

    if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
      return NextResponse.json({ success: false, error: 'Ліміт використань цього промокоду вичерпано' }, { status: 400 });
    }

    const now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return NextResponse.json({ success: false, error: 'Цей промокод ще не діє' }, { status: 400 });
    }

    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return NextResponse.json({ success: false, error: 'Термін дії цього промокоду минув' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      promo: {
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value
      }
    });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json({ success: false, error: 'Помилка сервера' }, { status: 500 });
  }
}
