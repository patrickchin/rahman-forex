import { NextResponse } from 'next/server';

// Route: /api/p2p/search/[side]/[asset]/[fiat]/route.ts
// This route is disabled - use individual exchange routes instead
export async function GET(
  req: Request,
  context: { params: Promise<{ side?: string; asset?: string; fiat?: string }> }
) {
  const paramsObj = await context.params;
  const side = paramsObj.side?.toLowerCase() || 'sell';
  const asset = paramsObj.asset?.toLowerCase() || 'usdt';
  const fiat = paramsObj.fiat?.toLowerCase() || 'cny';

  return NextResponse.json({
    error: 'Aggregated exchange data is not available. Please use individual exchange endpoints.',
    available_endpoints: [
      `/api/p2p/search/${side}/${asset}/${fiat}/binance`,
      `/api/p2p/search/${side}/${asset}/${fiat}/bybit`,
      `/api/p2p/search/${side}/${asset}/${fiat}/okx`,
      `/api/p2p/search/${side}/${asset}/${fiat}/gate`,
    ]
  }, { status: 400 });
}
