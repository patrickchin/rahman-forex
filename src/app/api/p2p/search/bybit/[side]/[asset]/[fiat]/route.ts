import { NextResponse } from "next/server";

const BYBIT_P2P_URL = "https://api2.bybit.com/fiat/otc/item/online";

// Route: /api/p2p/search/bybit/[side]/[asset]/[fiat]/route.ts
export async function GET(
  req: Request,
  context: { params: Promise<{ side?: string; asset?: string; fiat?: string }> }
) {
  try {
    const paramsObj = await context.params;
    const { searchParams } = new URL(req.url);
    const minAmount = searchParams.get('minAmount');
    
    const side = paramsObj.side?.toUpperCase() || 'BUY';
    const asset = paramsObj.asset?.toUpperCase() || 'USDT';
    const fiat = paramsObj.fiat?.toUpperCase() || 'NGN';
    const payload = {
      userId: '',
      tokenId: asset,
      currencyId: fiat,
      payment: [],
      side: side === 'SELL' ? '0' : '1', // '1' = BUY, '0' = SELL
      size: '20',
      page: '1',
      amount: minAmount || '',
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
    const response = await fetch(BYBIT_P2P_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Bybit P2P data" },
        { status: 500 }
      );
    }
    const data = await response.json();
    const items = data?.result?.items || [];
    const mappedItems = items.map((ad: any, idx: number) => ({
      time: ad.createDate ? new Date(Number(ad.createDate)).toLocaleString() : "",
      userId: ad.userId || ad.accountId || "",
      name: ad.nickName || "",
      price: Number(ad.price),
      min: Number(ad.minAmount),
      max: Number(ad.maxAmount),
      available: Number(ad.lastQuantity),
      currency: ad.currencyId || fiat,
      payment: Array.isArray(ad.payments) ? ad.payments.join(", ") : "",
      side: ad.side === 1 ? "BUY" : "SELL",
      key: ad.id || ad.userId || ad.accountId || ad.createDate || idx,
    }));
    return NextResponse.json({
      data: mappedItems,
      fetched_at: new Date().toISOString(),
      raw: data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
