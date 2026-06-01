const fs = require('fs');

async function check() {
  const envContent = fs.readFileSync('.env', 'utf-8') + '\n' + (fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf-8') : '');
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n]+)/);
  const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n]+)/);

  if (!urlMatch || !keyMatch) {
    console.log('Credentials not found');
    return;
  }

  const url = urlMatch[1].trim();
  const key = keyMatch[1].trim();

  const res = await fetch(`${url}/rest/v1/orders?limit=1`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });

  const data = await res.json();
  console.log('Data:', data);
}

check();
