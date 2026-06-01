const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      order_number: Math.floor(100000 + Math.random() * 900000).toString(),
      customer_name: 'Test Name',
      customer_email: 'test@test.com',
      customer_phone: '+380999999999',
      customer_comment: 'test',
      shipping_address: 'м. Київ, відділення 1',
      total_amount: 1499,
      payment_method: 'liqpay',
    })
    .select()
    .single();
    
  console.log('Result:', {data, error});
}

test();
