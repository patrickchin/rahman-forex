import { describe, it, expect } from 'vitest';
import { parseSearchParams, sortOffers, validateSide } from '@/lib/p2p/types';
import type { P2POffer } from '@/lib/p2p/types';

describe('P2P types and utilities', () => {
  describe('validateSide', () => {
    it('accepts BUY and SELL', () => {
      expect(validateSide('BUY')).toBe(true);
      expect(validateSide('SELL')).toBe(true);
    });

    it('rejects invalid sides', () => {
      expect(validateSide('HOLD')).toBe(false);
      expect(validateSide('')).toBe(false);
    });
  });

  describe('parseSearchParams', () => {
    it('parses valid params', () => {
      const result = parseSearchParams(
        { side: 'buy', asset: 'usdt', fiat: 'cny' },
        new URLSearchParams(),
      );
      expect(result).toEqual({
        side: 'BUY',
        asset: 'USDT',
        fiat: 'CNY',
        fiatAmount: undefined,
      });
    });

    it('includes fiatAmount when provided', () => {
      const result = parseSearchParams(
        { side: 'sell', asset: 'btc', fiat: 'ngn' },
        new URLSearchParams('fiatAmount=1000'),
      );
      expect(result.fiatAmount).toBe('1000');
    });

    it('throws on invalid side', () => {
      expect(() =>
        parseSearchParams({ side: 'HOLD' }, new URLSearchParams()),
      ).toThrow('Invalid side');
    });

    it('uses defaults for missing params', () => {
      const result = parseSearchParams({}, new URLSearchParams());
      expect(result.side).toBe('BUY');
      expect(result.asset).toBe('USDT');
      expect(result.fiat).toBe('CNY');
    });
  });

  describe('sortOffers', () => {
    const offers: P2POffer[] = [
      { key: '1', name: 'A', price: 7.10, min: 100, max: 1000, available: 500, exchange: 'test' },
      { key: '2', name: 'B', price: 6.90, min: 100, max: 1000, available: 500, exchange: 'test' },
      { key: '3', name: 'C', price: 7.00, min: 100, max: 1000, available: 500, exchange: 'test' },
    ];

    it('sorts ascending for BUY (cheapest first)', () => {
      const sorted = sortOffers(offers, 'BUY');
      expect(sorted[0].price).toBe(6.90);
      expect(sorted[1].price).toBe(7.00);
      expect(sorted[2].price).toBe(7.10);
    });

    it('sorts descending for SELL (highest first)', () => {
      const sorted = sortOffers(offers, 'SELL');
      expect(sorted[0].price).toBe(7.10);
      expect(sorted[1].price).toBe(7.00);
      expect(sorted[2].price).toBe(6.90);
    });

    it('does not mutate the original array', () => {
      const original = [...offers];
      sortOffers(offers, 'BUY');
      expect(offers).toEqual(original);
    });
  });
});
