import { beforeEach, describe, expect, it, vi } from 'vitest';

const { selectMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
}));

vi.mock('@/db', async () => {
  const schema = await vi.importActual<typeof import('@/db/schema')>('@/db/schema');

  return {
    db: {
      select: selectMock,
    },
    priceSnapshots: schema.priceSnapshots,
  };
});

import { GET } from '@/app/api/p2p/history/[asset]/[fiat]/route';

function buildQueryChain(result: unknown, reject = false) {
  const limit = reject
    ? vi.fn().mockRejectedValue(result)
    : vi.fn().mockResolvedValue(result);
  const orderBy = vi.fn(() => ({ limit }));
  const where = vi.fn(() => ({ orderBy }));
  const from = vi.fn(() => ({ where }));

  selectMock.mockReturnValue({ from });
}

describe('history route', () => {
  beforeEach(() => {
    selectMock.mockReset();
  });

  it('returns rows when snapshots exist', async () => {
    buildQueryChain([
      {
        recorded_at: new Date('2026-04-18T09:00:00.000Z'),
        exchange: 'bybit',
        best_price: '1500.000000',
        avg_price: '1502.500000',
        offer_count: 12,
        total_volume: '1200000.00',
      },
    ]);

    const request = new Request('http://localhost:3000/api/p2p/history/usdt/ngn?side=BUY&period=24h');
    const response = await GET(request, { params: Promise.resolve({ asset: 'usdt', fiat: 'ngn' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].exchange).toBe('bybit');
  });

  it('returns an empty dataset when the table is missing', async () => {
    buildQueryChain({ code: '42P01', message: 'relation does not exist' }, true);

    const request = new Request('http://localhost:3000/api/p2p/history/usdt/ngn?side=BUY&period=24h');
    const response = await GET(request, { params: Promise.resolve({ asset: 'usdt', fiat: 'ngn' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.warning).toContain('price_snapshots table');
  });
});