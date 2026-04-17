import type { ExchangeAdapter } from './types';
import { binanceAdapter } from './binance';
import { bybitAdapter } from './bybit';
import { okxAdapter } from './okx';
import { gateAdapter } from './gate';
import { htxAdapter } from './htx';
import { kucoinAdapter } from './kucoin';
import { bitgetAdapter } from './bitget';

export const exchangeAdapters: Record<string, ExchangeAdapter> = {
  binance: binanceAdapter,
  bybit: bybitAdapter,
  okx: okxAdapter,
  gate: gateAdapter,
  htx: htxAdapter,
  kucoin: kucoinAdapter,
  bitget: bitgetAdapter,
};

export { parseSearchParams, sortOffers } from './types';
export type { P2POffer, P2PSearchParams, ExchangeResult, ExchangeAdapter } from './types';
