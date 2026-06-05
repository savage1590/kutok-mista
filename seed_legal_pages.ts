import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8').split('\n');
  envConfig.forEach(line => {
    const match = line.match(/^([^=:#]+?)[=:](.*)/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
}

async function seed() {
  const { supabaseAdmin } = await import('./src/lib/supabaseAdmin.ts');
  
  try {
    const data = JSON.parse(fs.readFileSync('./legal_pages_seed.json', 'utf8'));
    
    // Check if legal_pages already exists
    const { data: existing } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('key', 'legal_pages')
      .single();
      
    if (existing) {
      console.log('legal_pages setting already exists, updating...');
      const { error } = await supabaseAdmin
        .from('settings')
        .update({ value: data })
        .eq('key', 'legal_pages');
        
      if (error) throw error;
      console.log('Updated successfully.');
    } else {
      console.log('legal_pages setting does not exist, inserting...');
      const { error } = await supabaseAdmin
        .from('settings')
        .insert({ key: 'legal_pages', value: data });
        
      if (error) throw error;
      console.log('Inserted successfully.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

seed();
