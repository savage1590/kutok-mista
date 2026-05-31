import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { cityRef } = await request.json();
    
    if (!cityRef || typeof cityRef !== 'string') {
      return NextResponse.json({ error: 'City ref is required' }, { status: 400 });
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
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityRef: cityRef,
          Language: 'UA'
        }
      })
    });

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json({ error: 'Failed to fetch warehouses from Nova Poshta' }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const warehouses = data.data.map((warehouse: any) => {
      // Determine if it is a postomat
      const isLocker = warehouse.CategoryOfWarehouse === 'Postomat' || warehouse.Description.toLowerCase().includes('поштомат');
      
      return {
        ref: warehouse.Ref,
        name: warehouse.Description,
        typeRef: warehouse.TypeOfWarehouse,
        isLocker
      };
    });

    return NextResponse.json({ warehouses });
  } catch (error) {
    console.error('Nova Poshta API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
