const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');

loadEnvConfig(process.cwd());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const defaultPaymentMethods = [
  {
    id: "liqpay",
    type: "system",
    isActive: true,
    name_ua: "Онлайн-оплата (LiqPay)",
    name_en: "Online payment (LiqPay)",
    description_ua: "Миттєва оплата карткою",
    description_en: "Instant card payment"
  },
  {
    id: "cash_on_delivery",
    type: "system",
    isActive: true,
    name_ua: "Накладений платіж",
    name_en: "Cash on Delivery",
    description_ua: "Комісія Нової Пошти 2% + 20 грн",
    description_en: "Nova Poshta fee 2% + 20 UAH"
  },
  {
    id: "full_payment",
    type: "system",
    isActive: true,
    name_ua: "Повна оплата за реквізитами",
    name_en: "Direct bank transfer",
    description_ua: "Оплата на карту Приват/Моно. Деталі будуть надіслані.",
    description_en: "Payment to card. Details will be sent."
  }
];

async function run() {
  const { data, error } = await supabase
    .from('settings')
    .select('key')
    .eq('key', 'payment_methods')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error);
    return;
  }

  if (data) {
    const { error: updateError } = await supabase
      .from('settings')
      .update({ value: defaultPaymentMethods })
      .eq('key', 'payment_methods');
    if (updateError) console.error('Update error:', updateError);
    else console.log('Successfully updated payment_methods');
  } else {
    const { error: insertError } = await supabase
      .from('settings')
      .insert({ key: 'payment_methods', value: defaultPaymentMethods });
    if (insertError) console.error('Insert error:', insertError);
    else console.log('Successfully inserted payment_methods');
  }
}

run();
