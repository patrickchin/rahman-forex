import type { ExchangeAdapter, P2POffer, P2PSearchParams } from './types';
import { fetchWithTimeout } from './types';

const GATE_P2P_URL = 'https://www.gate.com/json_svr/query_push/';

export const gateAdapter: ExchangeAdapter = {
  id: 'gate',
  name: 'Gate',

  async fetch(params: P2PSearchParams): Promise<readonly P2POffer[]> {
    const body = new URLSearchParams({
      type: 'push_order_list',
      symbol: `${params.asset}_${params.fiat}`,
      big_trade: '0',
      fiat_amount: params.fiatAmount || '',
      amount: '',
      pay_type: '',
      is_blue: '0',
      is_crown: '0',
      is_follow: '0',
      have_traded: '0',
      no_query_hide: '0',
      remove_limit: '0',
      per_page: '20',
      push_type: params.side === 'SELL' ? 'BUY' : 'SELL',
      sort_type: '1',
      page: '1',
    });

    const response = await fetchWithTimeout(GATE_P2P_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        csrftoken: '1',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Gate API returned ${response.status}`);
    }

    const data = await response.json();
    const items = data?.push_order || [];
    return items.map((ad: Record<string, unknown>, idx: number) => {
      const limit = String(ad.limit_total || ad.limit_fiat || '');
      const [min, max] = limit.includes('~')
        ? limit.split('~').map((v: string) => v.trim())
        : ['', ''];
      return {
        key: String(ad.oid || ad.uid || ad.username || idx),
        name: String(ad.username || ''),
        price: Number(ad.rate),
        min: Number(min),
        max: Number(max),
        available: Number(ad.amount),
        exchange: 'gate',
      };
    });
  },
};
