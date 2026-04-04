import { NextResponse } from 'next/server';
import { exchangeAdapters, parseSearchParams, sortOffers } from '@/lib/p2p';

// Route: /api/p2p/search/[side]/[asset]/[fiat]/[exchange]
// Handles individual exchange + "all" aggregation in a single route
export async function GET(
  req: Request,
  context: { params: Promise<{ side?: string; asset?: string; fiat?: string; exchange?: string }> }
) {
  try {
    const paramsObj = await context.params;
    const { searchParams: urlSearchParams } = new URL(req.url);
    const exchangeId = paramsObj.exchange?.toLowerCase() || '';

    const params = parseSearchParams(
      { side: paramsObj.side, asset: paramsObj.asset, fiat: paramsObj.fiat },
      urlSearchParams,
    );

    // Single exchange
    if (exchangeId !== 'all') {
      const adapter = exchangeAdapters[exchangeId];
      if (!adapter) {
        return NextResponse.json(
          { error: `Unknown exchange: ${exchangeId}. Valid: ${Object.keys(exchangeAdapters).join(', ')}` },
          { status: 400 },
        );
      }

      const offers = await adapter.fetch(params);
      const sorted = sortOffers(offers, params.side);

      return NextResponse.json({
        data: sorted,
        fetched_at: new Date().toISOString(),
      });
    }

    // Aggregate all exchanges — call APIs directly via adapters (no self-HTTP)
    const adapterEntries = Object.values(exchangeAdapters);
    const results = await Promise.allSettled(
      adapterEntries.map(async (adapter) => {
        const startTime = Date.now();
        try {
          const offers = await adapter.fetch(params);
          return {
            exchange: adapter.id,
            exchangeName: adapter.name,
            data: offers,
            error: null,
            duration_ms: Date.now() - startTime,
            fetched_at: new Date().toISOString(),
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          return {
            exchange: adapter.id,
            exchangeName: adapter.name,
            data: [] as const,
            error: message,
            duration_ms: Date.now() - startTime,
            fetched_at: new Date().toISOString(),
          };
        }
      }),
    );

    const exchangeResults = results.map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : {
            exchange: adapterEntries[i].id,
            exchangeName: adapterEntries[i].name,
            data: [] as const,
            error: r.reason?.message || 'Promise rejected',
            duration_ms: 0,
            fetched_at: new Date().toISOString(),
          },
    );

    const allOffers = exchangeResults.flatMap((r) =>
      r.data.map((offer) => ({
        ...offer,
        exchangeName: r.exchangeName,
        key: `${r.exchange}-${offer.key}`,
      })),
    );

    const sorted = sortOffers(allOffers, params.side);
    const successCount = exchangeResults.filter((r) => !r.error && r.data.length > 0).length;

    return NextResponse.json({
      data: sorted,
      exchanges: exchangeResults,
      summary: {
        total_exchanges_queried: adapterEntries.length,
        successful_exchanges: successCount,
        total_offers: sorted.length,
        side: params.side,
        asset: params.asset,
        fiat: params.fiat,
        fiat_amount: params.fiatAmount || null,
      },
      fetched_at: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
