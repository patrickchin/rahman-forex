import { ExchangeAdapter, P2POrder } from '../../types';

const gateAdapter: ExchangeAdapter = {
  name: 'Gate',
  async fetchP2POrders(asset: string, fiat: string, side: 'BUY' | 'SELL'): Promise<P2POrder[]> {
    try {
      // Call Next.js API route instead of direct axios
      const params = new URLSearchParams({ asset, fiat, side });
      const res = await fetch(`/api/gate?${params.toString()}`);
      const data = await res.json();
      if (data?.push_order) {
        return data.push_order.map((order: any) => transformOrder(order, asset, fiat, side));
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
