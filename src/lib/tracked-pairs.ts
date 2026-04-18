export interface TrackedPair {
  readonly asset: string;
  readonly fiat: string;
  readonly side: 'BUY' | 'SELL';
}

/**
 * Currency pairs to snapshot on each cron run.
 * Derived from the routes on the home page:
 *   NGN → USDT → CNY  and  KES → USDT → CNY
 */
export const TRACKED_PAIRS: readonly TrackedPair[] = [
  { asset: 'USDT', fiat: 'NGN', side: 'BUY' },
  { asset: 'USDT', fiat: 'CNY', side: 'SELL' },
  { asset: 'USDT', fiat: 'KES', side: 'BUY' },
] as const;
