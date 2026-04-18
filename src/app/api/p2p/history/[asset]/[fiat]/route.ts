import { NextResponse } from 'next/server';
import { db, priceSnapshots } from '@/db';
import { and, eq, gte, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type DatabaseError = {
  code?: string;
  message?: string;
};

function isMissingRelationError(error: unknown): error is DatabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as DatabaseError).code === '42P01'
  );
}

const PERIOD_MS: Record<string, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

// GET /api/p2p/history/[asset]/[fiat]?side=BUY&exchange=bybit&period=24h
export async function GET(
  req: Request,
  context: { params: Promise<{ asset?: string; fiat?: string }> },
) {
  const paramsObj = await context.params;
  const asset = paramsObj.asset?.toUpperCase() || 'USDT';
  const fiat = paramsObj.fiat?.toUpperCase() || 'NGN';

  const { searchParams } = new URL(req.url);
  const side = searchParams.get('side')?.toUpperCase() || 'BUY';
  const exchange = searchParams.get('exchange')?.toLowerCase() || null;
  const period = searchParams.get('period') || '24h';

  const periodMs = PERIOD_MS[period];
  if (!periodMs) {
    return NextResponse.json(
      { error: `Invalid period: ${period}. Valid: ${Object.keys(PERIOD_MS).join(', ')}` },
      { status: 400 },
    );
  }

  const since = new Date(Date.now() - periodMs);

  const conditions = [
    eq(priceSnapshots.asset, asset),
    eq(priceSnapshots.fiat, fiat),
    eq(priceSnapshots.side, side),
    gte(priceSnapshots.recorded_at, since),
  ];

  if (exchange) {
    conditions.push(eq(priceSnapshots.exchange, exchange));
  }

  try {
    const rows = await db
      .select({
        recorded_at: priceSnapshots.recorded_at,
        exchange: priceSnapshots.exchange,
        best_price: priceSnapshots.best_price,
        avg_price: priceSnapshots.avg_price,
        offer_count: priceSnapshots.offer_count,
        total_volume: priceSnapshots.total_volume,
      })
      .from(priceSnapshots)
      .where(and(...conditions))
      .orderBy(desc(priceSnapshots.recorded_at))
      .limit(2000);

    return NextResponse.json({
      asset,
      fiat,
      side,
      exchange: exchange || 'all',
      period,
      data: rows,
    });
  } catch (error) {
    if (isMissingRelationError(error)) {
      return NextResponse.json({
        asset,
        fiat,
        side,
        exchange: exchange || 'all',
        period,
        data: [],
        warning: 'price_snapshots table is not available yet',
      });
    }

    throw error;
  }
}
