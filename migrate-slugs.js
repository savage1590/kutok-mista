const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const SUPABASE_KEY = envLocal.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

function slugify(text) {
  if (!text) return "";
  let str = text.toString().toLowerCase();
  
  return str
    .replace(/\s+/g, '-') 
    .replace(/[^\w\-]+/g, '') 
    .replace(/\-\-+/g, '-') 
    .replace(/^-+/, '') 
    .replace(/-+$/, ''); 
}

async function run() {
  console.log("Starting DB migration for slugs...");
  
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('id, name_en, name_ua');
    
  if (error) {
    console.error("Error fetching products:", error);
    return;
  }
  
  for (const product of products) {
    let baseName = product.name_en || product.name_ua || 'product';
    let slug = slugify(baseName);
    if (!slug) slug = 'product';
    
    slug = `${slug}-${product.id.split('-')[0]}`;
    
    console.log(`Updating product ${product.id} -> ${slug}`);
    
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({ slug: slug })
      .eq('id', product.id);
      
    if (updateError) {
      console.error(`Error updating product ${product.id}:`, updateError);
    }
  }
  
  console.log("Done updating slugs!");
}

run();
