import type { ExchangeAdapter } from './types';
import { binanceAdapter } from './binance';
import { bybitAdapter } from './bybit';
import { okxAdapter } from './okx';
import { gateAdapter } from './gate';

export const exchangeAdapters: Record<string, ExchangeAdapter> = {
  binance: binanceAdapter,
  bybit: bybitAdapter,
  okx: okxAdapter,
  gate: gateAdapter,
};

export { parseSearchParams, sortOffers } from './types';
export type { P2POffer, P2PSearchParams, ExchangeResult, ExchangeAdapter } from './types';
