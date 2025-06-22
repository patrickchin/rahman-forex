import { ExchangeAdapter, P2POrder } from '../../types';

const bybitAdapter: ExchangeAdapter = {
  name: 'Bybit',
  async fetchP2POrders(asset: string, fiat: string, side: 'BUY' | 'SELL'): Promise<P2POrder[]> {
    try {
      // Call Next.js API route instead of direct axios
      const params = new URLSearchParams({ asset, fiat, side });
      const res = await fetch(`/api/bybit?${params.toString()}`);
      const data = await res.json();
      if (data?.result?.items) {
        return data.result.items.map((order: any) => transformOrder(order, asset, fiat));
      }
      return [];
    } catch (error) {
      console.error(`Bybit API error for ${asset}/${fiat} ${side}:`, error);
      return [];
    }
  }
};

function transformOrder(order: any, asset: string, fiat: string): P2POrder {
  return {
    id: `bybit-${order.id || Math.random()}`,
    exchange: 'Bybit',
    asset,
    fiatCurrency: fiat,
    side: order.side === '1' ? 'BUY' : 'SELL',
    price: parseFloat(order.price || '0'),
    minAmount: parseFloat(order.minAmount || '0'),
    maxAmount: parseFloat(order.maxAmount || '0'),
    availableAmount: parseFloat(order.quantity || '0'),
    paymentMethods: order.payments?.map((p: any) => p.name) || [],
    merchantName: order.nickName || 'Unknown',
    completionRate: parseFloat(order.finishRate || '0') * 100,
    orderCount: parseInt(order.recentOrderNum || '0'),
    timestamp: Date.now()
  };
}

export default bybitAdapter;