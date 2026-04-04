import type { ExchangeAdapter, P2POffer, P2PSearchParams } from './types';
import { fetchWithTimeout } from './types';

const BINANCE_P2P_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';

export const binanceAdapter: ExchangeAdapter = {
  id: 'binance',
  name: 'Binance',

  async fetch(params: P2PSearchParams): Promise<readonly P2POffer[]> {
    const body = {
      page: 1,
      rows: 20,
      payTypes: [],
      asset: params.asset,
      tradeType: params.side,
      fiat: params.fiat,
      publisherType: null,
      transAmount: params.fiatAmount || '',
    };

    const response = await fetchWithTimeout(BINANCE_P2P_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Binance API returned ${response.status}`);
    }

    const data = await response.json();
    return (data.data || []).map((item: Record<string, unknown>, idx: number) => {
      const adv = item.adv as Record<string, unknown>;
      const advertiser = item.advertiser as Record<string, unknown> | undefined;
      return {
        key: String(adv.advNo || idx),
        name: String(advertiser?.nickName || adv.userName || 'Unknown'),
        price: Number(adv.price),
        min: Number(adv.minSingleTransAmount),
        max: Number(adv.maxSingleTransAmount),
        available: Number(adv.surplusAmount),
        exchange: 'binance',
      };
    });
  },
};
