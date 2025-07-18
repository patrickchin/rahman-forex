import { NextResponse } from 'next/server';

// Binance P2P API endpoint for selling USDT for CNY
const BINANCE_P2P_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';

// Route: /api/p2p/search/binance/[side]/[asset]/[fiat]/route.ts
export async function GET(
  req: Request,
  context: { params: Promise<{ side?: string; asset?: string; fiat?: string }> }
) {
  try {
    // Await params for Next.js dynamic API routes
    const paramsObj = await context.params;
    const { searchParams } = new URL(req.url);
    const fiatAmount = searchParams.get('fiatAmount') || '';
    
    const side = paramsObj.side?.toUpperCase() || 'SELL';
    const asset = paramsObj.asset?.toUpperCase() || 'USDT';
    const fiat = paramsObj.fiat?.toUpperCase() || 'CNY';
    const body = {
      page: 1,
      rows: 20,
      payTypes: [],
      asset,
      tradeType: side,
      fiat,
      publisherType: null,
      transAmount: fiatAmount,
    };
    const response = await fetch(BINANCE_P2P_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch Binance P2P data' }, { status: 500 });
    }
    const data = await response.json();
    // Normalize data to match frontend expectations
    const result = (data.data || []).map((item: any, idx: number) => {
      const adv = item.adv;
      return {
        key: adv.advNo || idx,
        name: item.advertiser?.nickName || adv.userName || 'Unknown',
        price: Number(adv.price),
        min: Number(adv.minSingleTransAmount),
        max: Number(adv.maxSingleTransAmount),
        available: Number(adv.surplusAmount),
      };
    });

    // Sort by price (ascending for buy, descending for sell)
    result.sort((a: any, b: any) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      
      // For BUY side: sort by price ascending (cheapest first)
      // For SELL side: sort by price descending (highest first)
      return side === 'BUY' ? priceA - priceB : priceB - priceA;
    });

    return NextResponse.json({
      data: result,
      fetched_at: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}
