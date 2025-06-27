import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Binance P2P API endpoint for selling USDT for CNY
const BINANCE_P2P_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';

export async function GET() {
  try {
    const body = {
      page: 1,
      rows: 20,
      payTypes: [],
      asset: 'USDT',
      tradeType: 'SELL',
      fiat: 'CNY',
      publisherType: null,
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
        available: Number(adv.availableAmount),
      };
    });
    return NextResponse.json({
      data: result,
      fetched_at: new Date().toISOString(),
      raw: data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}
