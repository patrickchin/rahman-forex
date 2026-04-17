import type { ExchangeAdapter, P2POffer, P2PSearchParams } from './types';
import { fetchWithTimeout } from './types';

const BITGET_P2P_URL = 'https://www.bitget.com/v1/p2p/pub/adv/queryAdvList';

export const bitgetAdapter: ExchangeAdapter = {
  id: 'bitget',
  name: 'Bitget',

  async fetch(params: P2PSearchParams): Promise<readonly P2POffer[]> {
    // Bitget side: 1 = user buys crypto, 2 = user sells crypto
    const bitgetSide = params.side === 'BUY' ? 1 : 2;

    const body = {
      side: bitgetSide,
      pageNo: 1,
      pageSize: 20,
      coinCode: params.asset,
      fiatCode: params.fiat,
      orderBy: 1,
      adAreaId: 0,
      attentionMerchantFlag: false,
      rookieFriendlyFlag: false,
      allowPlaceOrderFlag: '1',
      languageType: 0,
    };

    const response = await fetchWithTimeout(BITGET_P2P_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:149.0) Gecko/20100101 Firefox/149.0',
        'Accept': 'application/json',
        'Referer': 'https://www.bitget.com/p2p-trade',
        'locale': 'en_US',
        'language': 'en_US',
        'terminaltype': '1',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Bitget API returned ${response.status}`);
    }

    const data = await response.json();
    const items = data?.data?.dataList || [];
    return items.map((ad: Record<string, unknown>, idx: number) => ({
      key: String(ad.adNo || ad.encryptUserId || idx),
      name: String(ad.nickName || ''),
      price: Number(ad.price),
      min: Number(ad.minAmount),
      max: Number(ad.maxAmount),
      available: Number(ad.lastAmount),
      exchange: 'bitget',
    }));
  },
};
