import { NextResponse } from "next/server";

// OKX P2P API endpoint
const OKX_P2P_URL = "https://www.okx.com/v3/c2c/tradingOrders/books";

// Route: /api/p2p/search/okx/[side]/[asset]/[fiat]/route.ts
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
    // OKX: side 'BUY' = user wants to buy crypto (show sellers), 'SELL' = user wants to sell crypto (show buyers)
    // API param: "side" is 'buy' or 'sell' (lowercase)
    const okxSide = side.toLowerCase();
    const params = new URLSearchParams({
      quoteCurrency: fiat,
      baseCurrency: asset,
      side: okxSide,
      paymentMethod: '',
      userType: 'all',
      showTrade: 'false',
      showFollow: 'false',
      showAlreadyTraded: 'false',
      sortType: 'price',
      sortOrder: 'desc',
      limit: '20',
      offset: '0',
      ...(minAmount && minAmount !== '0' && { minAmount }),
    });
    const response = await fetch(`${OKX_P2P_URL}?${params.toString()}`);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch OKX P2P data' }, { status: 500 });
    }
    const data = await response.json();
    const items = data?.data[okxSide] || [];
    // Map OKX ads to unified type
    const mappedItems = items.map((ad: any, idx: number) => {
      return {
        time: ad.id || '',
        userId: ad.publicUserId || ad.merchantId || '',
        name: ad.nickName || '',
        price: Number(ad.price),
        min: Number(ad.quoteMinAmountPerOrder),
        max: Number(ad.quoteMaxAmountPerOrder),
        available: Number(ad.availableAmount),
        currency: ad.baseCurrency || asset,
        payment: Array.isArray(ad.paymentMethods) ? ad.paymentMethods.join(', ') : '',
        side: ad.side ? ad.side.toUpperCase() : side,
        key: ad.id || ad.publicUserId || ad.merchantId || idx,
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
