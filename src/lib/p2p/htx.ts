import type { ExchangeAdapter, P2POffer, P2PSearchParams } from './types';
import { fetchWithTimeout } from './types';

const HTX_P2P_URL = 'https://www.htx.com/-/x/otc/v1/data/trade-market';

// HTX uses numeric IDs for coins and currencies
const COIN_IDS: Record<string, number> = {
  BTC: 1,
  USDT: 2,
  ETH: 3,
};

const CURRENCY_IDS: Record<string, number> = {
  SGD: 2,
  AUD: 3,
  INR: 4,
  VND: 5,
  CAD: 6,
  EUR: 7,
  TWD: 10,
  RUB: 11,
  GBP: 12,
  HKD: 13,
  MYR: 22,
  TRY: 23,
  NGN: 15,
  IDR: 16,
  PHP: 17,
  KHR: 18,
  BRL: 19,
  PLN: 20,
  NZD: 24,
};

export const htxAdapter: ExchangeAdapter = {
  id: 'htx',
  name: 'HTX',

  async fetch(params: P2PSearchParams): Promise<readonly P2POffer[]> {
    const coinId = COIN_IDS[params.asset.toUpperCase()];
    const currencyId = CURRENCY_IDS[params.fiat.toUpperCase()];

    if (!coinId || !currencyId) {
      return [];
    }

    const queryParams = new URLSearchParams({
      coinId: String(coinId),
      currency: String(currencyId),
      tradeType: params.side === 'BUY' ? 'buy' : 'sell',
      currPage: '1',
      payMethod: '0',
      acceptOrder: '0',
      country: '',
      blockType: 'general',
      online: '1',
      range: '0',
      amount: params.fiatAmount || '',
      onlyTradable: 'false',
      pageSize: '20',
    });

    const response = await fetchWithTimeout(`${HTX_P2P_URL}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTX API returned ${response.status}`);
    }

    const data = await response.json();
    const items = data?.data || [];
    return items.map((ad: Record<string, unknown>, idx: number) => ({
      key: String(ad.id || ad.uid || idx),
      name: String(ad.userName || ''),
      price: Number(ad.price),
      min: Number(ad.minTradeLimit),
      max: Number(ad.maxTradeLimit),
      available: Number(ad.tradeCount),
      exchange: 'htx',
    }));
  },
};
