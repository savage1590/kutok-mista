import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchString } = await request.json();
    
    if (!searchString || typeof searchString !== 'string') {
      return NextResponse.json({ error: 'Search string is required' }, { status: 400 });
    }

    const apiKey = process.env.NOVA_POSHTA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Nova Poshta API Key is not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        modelName: 'Address',
        calledMethod: 'getSettlements',
        methodProperties: {
          FindByString: searchString,
          Limit: "50"
        }
      })
    });

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json({ error: 'Failed to fetch cities from Nova Poshta' }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cities = data.data.map((city: any) => ({
      ref: city.Ref,
      name: `${city.SettlementTypeDescription} ${city.Description}, ${city.AreaDescription} обл.`,
      deliveryCityRef: city.DeliveryCity
    }));

    return NextResponse.json({ cities });
  } catch (error) {
    console.error('Nova Poshta API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
