import { NextResponse } from "next/server";

const GATE_P2P_URL = 'https://www.gate.com/json_svr/query_push/';

// Route: /api/p2p/search/gate/[side]/[asset]/[fiat]/route.ts
export async function GET(
  req: Request,
  context: { params: Promise<{ side?: string; asset?: string; fiat?: string }> }
) {
  try {
    // Await params for Next.js dynamic API routes
    const paramsObj = await context.params;
    const { searchParams } = new URL(req.url);
    const minAmount = searchParams.get('minAmount') || '0';
    
    const side = paramsObj.side?.toUpperCase() || 'SELL';
    const asset = paramsObj.asset?.toUpperCase() || 'USDT';
    const fiat = paramsObj.fiat?.toUpperCase() || 'CNY';
    const params = new URLSearchParams({
      type: 'push_order_list',
      symbol: `${asset}_${fiat}`,
      big_trade: '0',
      fiat_amount: minAmount,
      amount: '1000',
      pay_type: '',
      is_blue: '0',
      is_crown: '0',
      is_follow: '0',
      have_traded: '0',
      no_query_hide: '0',
      remove_limit: '0',
      per_page: '20',
      push_type: side === 'SELL' ? 'BUY' : 'SELL', // Gate uses 'BUY' for SELL side
      sort_type: '1',
      page: '1',
    });
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'csrftoken': '1',
    };
    const response = await fetch(GATE_P2P_URL, {
      method: 'POST',
      headers,
      body: params.toString(),
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch Gate P2P data' }, { status: 500 });
    }
    const data = await response.json();
    const items = data?.push_order || [];
    // Map Gate ads to unified type
    const mappedItems = items.map((ad: any, idx: number) => {
      const limit = ad.limit_total || ad.limit_fiat || '';
      const [min, max] = limit.includes('~') ? limit.split('~').map((v: string) => v.trim()) : ['', ''];
      return {
        time: ad.online_status || '',
        userId: ad.uid || ad.username || '',
        name: ad.username || '',
        price: Number(ad.rate),
        min: Number(min),
        max: Number(max),
        available: Number(ad.amount),
        currency: ad.curr_a || asset,
        payment: ad.pay_type_num || '',
        side: ad.type ? ad.type.toUpperCase() : side,
        key: ad.oid || ad.uid || ad.username || idx,
      };
    });
    return NextResponse.json({
      data: mappedItems,
      fetched_at: new Date().toISOString(),
      raw: data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}
