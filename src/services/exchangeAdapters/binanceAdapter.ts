import { ExchangeAdapter, P2POrder } from '../../types';

const binanceAdapter: ExchangeAdapter = {
  name: 'Binance',
  async fetchP2POrders(asset: string, fiat: string, side: 'BUY' | 'SELL'): Promise<P2POrder[]> {
    try {
      // Call Next.js API route instead of direct axios
      const params = new URLSearchParams({ asset, fiat, side });
      const res = await fetch(`/api/binance?${params.toString()}`);
      const data = await res.json();
      if (data?.success && data?.data) {
        return data.data.map((order: any) => transformOrder(order, asset, fiat));
      }
      return [];
    } catch (error) {
      console.error(`Binance API error for ${asset}/${fiat} ${side}:`, error);
      return [];
    }
  }
};

function transformOrder(order: any, asset: string, fiat: string): P2POrder {
  return {
    id: `binance-${order.adv?.advNo || Math.random()}`,
    exchange: 'Binance',
    asset,
    fiatCurrency: fiat,
    side: order.adv?.tradeType === 'BUY' ? 'BUY' : 'SELL',
    price: parseFloat(order.adv?.price || '0'),
    minAmount: parseFloat(order.adv?.minSingleTransAmount || '0'),
    maxAmount: parseFloat(order.adv?.maxSingleTransAmount || '0'),
    availableAmount: parseFloat(order.adv?.surplusAmount || '0'),
    paymentMethods: order.adv?.tradeMethods?.map((method: any) => method.payMethodName) || [],
    merchantName: order.advertiser?.nickName || 'Unknown',
    completionRate: parseFloat(order.advertiser?.orderCompleteRate || '0'),
    orderCount: parseInt(order.advertiser?.monthOrderCount || '0'),
    timestamp: Date.now()
  };
}

export default binanceAdapter;