import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { insertMock, valuesMock, fetchMock } = vi.hoisted(() => ({
  insertMock: vi.fn(),
  valuesMock: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock('@/db', async () => {
  const schema = await vi.importActual<typeof import('@/db/schema')>('@/db/schema');

  return {
    db: {
      insert: insertMock,
    },
    priceSnapshots: schema.priceSnapshots,
  };
});

vi.mock('@/lib/p2p', () => ({
  exchangeAdapters: {
    demo: {
      id: 'demo',
      name: 'Demo',
      fetch: fetchMock,
    },
  },
}));

vi.mock('@/lib/tracked-pairs', () => ({
  TRACKED_PAIRS: [{ asset: 'USDT', fiat: 'NGN', side: 'BUY' }],
}));

import { GET } from '@/app/api/cron/collect-prices/route';

describe('collect-prices route', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    valuesMock.mockResolvedValue(undefined);
    insertMock.mockReturnValue({ values: valuesMock });
    fetchMock.mockResolvedValue([
      {
        key: '1',
        name: 'Merchant',
        price: 1500,
        min: 100000,
        max: 500000,
        available: 1000,
        exchange: 'demo',
      },
    ]);
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.CRON_SECRET = originalCronSecret;
    insertMock.mockReset();
    valuesMock.mockReset();
    fetchMock.mockReset();
  });

  it('rejects unauthorized production requests', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CRON_SECRET = 'top-secret';

    const response = await GET(new Request('http://localhost:3000/api/cron/collect-prices'));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('allows development requests and stores snapshots', async () => {
    process.env.NODE_ENV = 'development';

    const response = await GET(new Request('http://localhost:3000/api/cron/collect-prices'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.snapshots_inserted).toBe(1);
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(valuesMock).toHaveBeenCalledTimes(1);
  });
});