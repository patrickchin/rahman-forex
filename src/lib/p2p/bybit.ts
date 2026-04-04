import type { ExchangeAdapter, P2POffer, P2PSearchParams } from './types';
import { fetchWithTimeout } from './types';

const BYBIT_P2P_URL = 'https://api2.bybit.com/fiat/otc/item/online';

export const bybitAdapter: ExchangeAdapter = {
  id: 'bybit',
  name: 'Bybit',

  async fetch(params: P2PSearchParams): Promise<readonly P2POffer[]> {
    const payload = {
      userId: '',
      tokenId: params.asset,
      currencyId: params.fiat,
      payment: [],
      side: params.side === 'SELL' ? '0' : '1',
      size: '20',
      page: '1',
      amount: params.fiatAmount || '',
      vaMaker: false,
      bulkMaker: false,
      canTrade: true,
      verificationFilter: 0,
      sortType: 'TRADE_PRICE',
      paymentPeriod: [],
      itemRegion: 1,
    };

    const response = await fetchWithTimeout(BYBIT_P2P_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json;charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Bybit API returned ${response.status}`);
    }

    const data = await response.json();
    const items = data?.result?.items || [];
    return items.map((ad: Record<string, unknown>, idx: number) => ({
      key: String(ad.id || ad.userId || ad.accountId || ad.createDate || idx),
      name: String(ad.nickName || ''),
      price: Number(ad.price),
      min: Number(ad.minAmount),
      max: Number(ad.maxAmount),
      available: Number(ad.lastQuantity),
      exchange: 'bybit',
    }));
  },
};
