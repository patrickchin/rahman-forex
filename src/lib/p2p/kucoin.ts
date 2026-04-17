import type { ExchangeAdapter, P2POffer, P2PSearchParams } from './types';
import { fetchWithTimeout } from './types';

const KUCOIN_P2P_URL = 'https://www.kucoin.com/_api/otc/ad/list';

export const kucoinAdapter: ExchangeAdapter = {
  id: 'kucoin',
  name: 'KuCoin',

  async fetch(params: P2PSearchParams): Promise<readonly P2POffer[]> {
    // KuCoin side convention: SELL = merchant sells (user buys), BUY = merchant buys (user sells)
    const kucoinSide = params.side === 'BUY' ? 'SELL' : 'BUY';

    const queryParams = new URLSearchParams({
      status: 'PUTUP',
      currency: params.asset,
      legal: params.fiat,
      page: '1',
      pageSize: '20',
      side: kucoinSide,
      amount: params.fiatAmount || '',
      payTypeCodes: '',
      sortCode: 'PRICE',
      highQualityMerchant: '0',
      canDealOrder: 'false',
      lang: 'en_US',
    });

    const response = await fetchWithTimeout(`${KUCOIN_P2P_URL}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:149.0) Gecko/20100101 Firefox/149.0',
        'Accept': 'application/json',
        'Referer': 'https://www.kucoin.com/otc/buy/USDT-EUR',
        'x-site': 'global',
      },
    });

    if (!response.ok) {
      throw new Error(`KuCoin API returned ${response.status}`);
    }

    const data = await response.json();
    const items = data?.items || [];
    return items.map((ad: Record<string, unknown>, idx: number) => ({
      key: String(ad.id || ad.userId || idx),
      name: String(ad.nickName || ''),
      price: Number(ad.floatPrice),
      min: Number(ad.limitMinQuote),
      max: Number(ad.limitMaxQuote),
      available: Number(ad.currencyBalanceQuantity),
      exchange: 'kucoin',
    }));
  },
};
