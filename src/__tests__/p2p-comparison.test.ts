import { describe, it, expect } from 'vitest';
import { exchangeAdapters } from '@/lib/p2p';
import type { P2PSearchParams } from '@/lib/p2p';

// These tests hit live exchange APIs. They verify:
// 1. Each adapter returns properly shaped data
// 2. API routes return correct responses
// Run with: npx vitest run src/__tests__/p2p-comparison.test.ts

const BASE = 'http://localhost:3000';
const BUY_USDT_CNY: P2PSearchParams = { side: 'BUY', asset: 'USDT', fiat: 'CNY' };
const BUY_USDT_NGN: P2PSearchParams = { side: 'BUY', asset: 'USDT', fiat: 'NGN' };

async function fetchJSON(url: string) {
  const res = await fetch(url);
  return res.json();
}

describe('P2P Exchange Adapters (live)', () => {
  describe.each([
    { name: 'binance', params: BUY_USDT_CNY },
    { name: 'bybit', params: BUY_USDT_NGN }, // Bybit has no CNY P2P
    { name: 'okx', params: BUY_USDT_CNY },
    { name: 'gate', params: BUY_USDT_CNY },
  ])('$name adapter', ({ name, params }) => {
    it('returns an array of properly shaped offers', async () => {
      const adapter = exchangeAdapters[name];
      const offers = await adapter.fetch(params);

      expect(Array.isArray(offers)).toBe(true);
      expect(offers.length).toBeGreaterThan(0);

      for (const offer of offers) {
        expect(offer).toHaveProperty('key');
        expect(offer).toHaveProperty('name');
        expect(typeof offer.price).toBe('number');
        expect(offer.price).toBeGreaterThan(0);
        expect(typeof offer.min).toBe('number');
        expect(typeof offer.max).toBe('number');
        expect(typeof offer.available).toBe('number');
        expect(offer.exchange).toBe(name);
      }
    });

    it('has consistent exchange field on all offers', async () => {
      const adapter = exchangeAdapters[name];
      const offers = await adapter.fetch(params);
      const exchanges = new Set(offers.map((o) => o.exchange));
      expect(exchanges.size).toBe(1);
      expect(exchanges.has(name)).toBe(true);
    });
  });
});

describe('API route responses (live)', () => {
  it.each([
    { exchange: 'binance', side: 'buy', asset: 'USDT', fiat: 'CNY' },
    { exchange: 'okx', side: 'buy', asset: 'USDT', fiat: 'CNY' },
    { exchange: 'gate', side: 'buy', asset: 'USDT', fiat: 'CNY' },
    { exchange: 'bybit', side: 'buy', asset: 'USDT', fiat: 'NGN' },
  ])(
    '$exchange: returns offers with correct shape',
    async ({ exchange, side, asset, fiat }) => {
      const data = await fetchJSON(
        `${BASE}/api/p2p/search/${side}/${asset}/${fiat}/${exchange}`,
      );

      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.fetched_at).toBeDefined();

      for (const offer of data.data) {
        expect(typeof offer.price).toBe('number');
        expect(offer.price).toBeGreaterThan(0);
        expect(offer.exchange).toBe(exchange);
      }
    },
  );

  it('/all: returns aggregated data with per-exchange timing', async () => {
    const data = await fetchJSON(`${BASE}/api/p2p/search/buy/USDT/CNY/all`);

    expect(data.summary).toBeDefined();
    expect(data.summary.total_exchanges_queried).toBe(4);
    expect(data.summary.successful_exchanges).toBeGreaterThanOrEqual(1);
    expect(data.data.length).toBe(data.summary.total_offers);

    expect(data.exchanges).toBeDefined();
    for (const ex of data.exchanges) {
      expect(typeof ex.duration_ms).toBe('number');
      expect(ex.duration_ms).toBeGreaterThanOrEqual(0);
    }
  });

  it('/all: offers are sorted by price', async () => {
    const data = await fetchJSON(`${BASE}/api/p2p/search/buy/USDT/CNY/all`);
    const prices = data.data.map((d: { price: number }) => d.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });
});

describe('Validation (live)', () => {
  it('returns 400 for unknown exchange', async () => {
    const res = await fetch(`${BASE}/api/p2p/search/buy/USDT/CNY/nonexistent`);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Unknown exchange');
  });

  it('returns 500 for invalid side', async () => {
    const res = await fetch(`${BASE}/api/p2p/search/HOLD/USDT/CNY/binance`);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('Invalid side');
  });
});
