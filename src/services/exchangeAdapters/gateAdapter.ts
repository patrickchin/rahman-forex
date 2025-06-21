import axios from 'axios';
import { ExchangeAdapter, P2POrder } from '../../types';

const GATE_API_URL = 'https://www.gate.com/json_svr/query_push/';

const gateAdapter: ExchangeAdapter = {
  name: 'Gate',
  async fetchP2POrders(asset: string, fiat: string, side: 'BUY' | 'SELL'): Promise<P2POrder[]> {
    try {
      // Gate.com expects symbol as e.g. USDT_CNY and push_type as 'buy' or 'sell'
      const symbol = `${asset}_${fiat}`;
      const params = new URLSearchParams({
        type: 'push_order_list',
        symbol,
        big_trade: '0',
        fiat_amount: '',
        amount: '',
        pay_type: '',
        is_blue: '0',
        is_crown: '0',
        is_follow: '0',
        have_traded: '0',
        no_query_hide: '0',
        remove_limit: '0',
        per_page: '20',
        push_type: side.toLowerCase(),
        sort_type: '1',
        page: '1',
      });
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'csrftoken': '1',
      };
      const response = await axios.post(
        'http://localhost:4000/proxy',
        {
          url: GATE_API_URL,
          method: 'POST',
          data: params.toString(),
          headers,
        },
        { timeout: 10000 }
      );
      console.log(`Gate API response for ${asset}/${fiat} ${side}:`, response.data);
      // Gate.com returns { push_order: [...] }
      if (response.data?.push_order) {
        return response.data.push_order.map((order: any) => transformOrder(order, asset, fiat, side));
      }
      return [];
    } catch (error) {
      console.error(`Gate API error for ${asset}/${fiat} ${side}:`, error);
      return [];
    }
  }
};

function transformOrder(order: any, asset: string, fiat: string, side: 'BUY' | 'SELL'): P2POrder {
  // Parse min/max from limit_total (e.g., "200~2272.14")
  let minAmount = 0, maxAmount = 0;
  if (typeof order.limit_total === 'string' && order.limit_total.includes('~')) {
    const [min, max] = order.limit_total.split('~').map(Number);
    minAmount = min;
    maxAmount = max;
  }
  return {
    id: `gate-${order.oid || Math.random()}`,
    exchange: 'Gate',
    asset,
    fiatCurrency: fiat,
    side,
    price: parseFloat(order.rate || '0'),
    minAmount,
    maxAmount,
    availableAmount: parseFloat(order.amount || '0'),
    paymentMethods: [order.pay_type_num?.toString() || ''], // Placeholder, as pay_type_num is a number
    merchantName: order.username || 'Unknown',
    completionRate: parseFloat(order.complete_rate_month || '0'),
    orderCount: parseInt(order.complete_number_month || '0'),
    timestamp: Date.now(),
  };
}

export default gateAdapter;
