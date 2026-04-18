import { NextResponse } from 'next/server';
import { db, priceSnapshots } from '@/db';
import { exchangeAdapters } from '@/lib/p2p';
import type { P2PSearchParams } from '@/lib/p2p';
import { TRACKED_PAIRS } from '@/lib/tracked-pairs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorizedCronRequest(req: Request): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const adapters = Object.values(exchangeAdapters);
  const rows: (typeof priceSnapshots.$inferInsert)[] = [];
  const errors: { exchange: string; pair: string; error: string }[] = [];

  // Build all fetch tasks: one per (pair × exchange)
  const tasks = TRACKED_PAIRS.flatMap((pair) =>
    adapters.map((adapter) => ({ pair, adapter })),
  );

  const results = await Promise.allSettled(
    tasks.map(async ({ pair, adapter }) => {
      const params: P2PSearchParams = {
        side: pair.side,
        asset: pair.asset,
        fiat: pair.fiat,
      };
      const offers = await adapter.fetch(params);
      return { pair, adapter, offers };
    }),
  );

  for (const result of results) {
    if (result.status === 'rejected') continue;

    const { pair, adapter, offers } = result.value;

    if (offers.length === 0) continue;

    const sorted = [...offers].sort((a, b) =>
      pair.side === 'BUY' ? a.price - b.price : b.price - a.price,
    );

    const bestPrice = sorted[0].price;
    const avgPrice =
      sorted.reduce((sum, o) => sum + o.price, 0) / sorted.length;
    const totalVolume = sorted.reduce(
      (sum, o) => sum + o.available * o.price,
      0,
    );

    rows.push({
      recorded_at: now,
      exchange: adapter.id,
      asset: pair.asset,
      fiat: pair.fiat,
      side: pair.side,
      best_price: String(bestPrice),
      avg_price: String(avgPrice),
      offer_count: sorted.length,
      total_volume: String(totalVolume),
    });
  }

  // Collect errors for reporting
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'rejected') {
      const { pair, adapter } = tasks[i];
      errors.push({
        exchange: adapter.id,
        pair: `${pair.side} ${pair.asset}/${pair.fiat}`,
        error: r.reason instanceof Error ? r.reason.message : 'Unknown error',
      });
    }
  }

  // Batch insert all rows
  if (rows.length > 0) {
    await db.insert(priceSnapshots).values(rows);
  }

  return NextResponse.json({
    ok: true,
    recorded_at: now.toISOString(),
    snapshots_inserted: rows.length,
    errors,
  });
}
