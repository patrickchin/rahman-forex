import type { ExchangeAdapter } from './types';
import { binanceAdapter } from './binance';
import { bybitAdapter } from './bybit';
import { okxAdapter } from './okx';
import { gateAdapter } from './gate';
import { htxAdapter } from './htx';
import { kucoinAdapter } from './kucoin';

export const exchangeAdapters: Record<string, ExchangeAdapter> = {
  binance: binanceAdapter,
  bybit: bybitAdapter,
  okx: okxAdapter,
  gate: gateAdapter,
  htx: htxAdapter,
  kucoin: kucoinAdapter,
};

export { parseSearchParams, sortOffers } from './types';
export type { P2POffer, P2PSearchParams, ExchangeResult, ExchangeAdapter } from './types';
