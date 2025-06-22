import { ExchangeAdapter, P2POrder } from '../../types';

const bitgetAdapter: ExchangeAdapter = {
  name: 'Bitget',
  async fetchP2POrders(asset: string, fiat: string, side: 'BUY' | 'SELL'): Promise<P2POrder[]> {
    try {
      // Call Next.js API route instead of direct axios
      const params = new URLSearchParams({ asset, fiat, side });
      const res = await fetch(`/api/bitget?${params.toString()}`);
      const data = await res.json();
      if (data?.data?.dataList) {
        return data.data.dataList.map((order: any) => transformOrder(order, asset, fiat, side));
      }
      return [];
    } catch (error) {
      console.error(`Bitget API error for ${asset}/${fiat} ${side}:`, error);
      return [];
    }
  },
};

function transformOrder(order: any, asset: string, fiat: string, side: 'BUY' | 'SELL'): P2POrder {
  return {
    id: `bitget-${order.advNo || Math.random()}`,
    exchange: 'Bitget',
    asset,
    fiatCurrency: fiat,
    side: side,
    price: parseFloat(order.price || '0'),
    minAmount: parseFloat(order.minAmount || '0'),
    maxAmount: parseFloat(order.maxAmount || '0'),
    availableAmount: parseFloat(order.availableAmount || '0'),
    paymentMethods: order.payMethods?.map((m: any) => m.payMethodName) || [],
    merchantName: order.nickName || 'Unknown',
    completionRate: parseFloat(order.finishRate || '0'),
    orderCount: parseInt(order.monthOrderCount || '0'),
    timestamp: Date.now()
  };
}

export default bitgetAdapter;
