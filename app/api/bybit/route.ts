import { NextRequest } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const asset = searchParams.get('asset') || 'USDT';
  const fiat = searchParams.get('fiat') || 'NGN';
  const side = searchParams.get('side') || 'SELL';
  try {
    const payload = {
      userId: '',
      tokenId: asset,
      currencyId: fiat,
      payment: [],
      side: side === 'BUY' ? '1' : '0',
      size: '20',
      page: '1',
      amount: '',
      vaMaker: false,
      bulkMaker: false,
      canTrade: true,
      verificationFilter: 0,
      sortType: 'TRADE_PRICE',
      paymentPeriod: [],
      itemRegion: 1
    };
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json;charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    const response = await axios.post(
      'https://api2.bybit.com/fiat/otc/item/online',
      payload,
      { headers, timeout: 10000 }
    );
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
