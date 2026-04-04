import type { ExchangeAdapter, P2POffer, P2PSearchParams } from './types';
import { fetchWithTimeout } from './types';

const OKX_P2P_URL = 'https://www.okx.com/v3/c2c/tradingOrders/books';

export const okxAdapter: ExchangeAdapter = {
  id: 'okx',
  name: 'OKX',

  async fetch(params: P2PSearchParams): Promise<readonly P2POffer[]> {
    const okxSide = params.side === 'BUY' ? 'sell' : 'buy';
    const queryParams = new URLSearchParams({
      quoteCurrency: params.fiat,
      baseCurrency: params.asset,
      side: okxSide,
      paymentMethod: 'all',
      userType: 'all',
      receivingAds: 'false',
      ...(params.fiatAmount && { quoteMinAmountPerOrder: params.fiatAmount }),
      t: Date.now().toString(),
    });

    const response = await fetchWithTimeout(`${OKX_P2P_URL}?${queryParams.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`OKX API returned ${response.status}`);
    }

    const data = await response.json();
    const items = data?.data?.[okxSide] || [];
    return items.map((ad: Record<string, unknown>, idx: number) => ({
      key: String(ad.id || ad.publicUserId || ad.merchantId || idx),
      name: String(ad.nickName || ''),
      price: Number(ad.price),
      min: Number(ad.quoteMinAmountPerOrder),
      max: Number(ad.quoteMaxAmountPerOrder),
      available: Number(ad.availableAmount),
      exchange: 'okx',
    }));
  },
};
