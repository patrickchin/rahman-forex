import axios from 'axios';
import { ExchangeAdapter, P2POrder } from '../../types';

const BYBIT_API_URL = 'https://api2.bybit.com/fiat/otc/item/online';

const bybitAdapter: ExchangeAdapter = {
  name: 'Bybit',
  async fetchP2POrders(asset: string, fiat: string, side: 'BUY' | 'SELL'): Promise<P2POrder[]> {
    try {
      // Bybit expects asset as USDT, fiat as NGN
      const payload = {
        userId: '',
        tokenId: asset,
        currencyId: fiat,
        payment: [],
        side: side === 'BUY' ? '1' : '0',
        size: '20',
        page: '1',
        amount: '',
        vaMaker: false,
        bulkMaker: false,
        canTrade: true,
        verificationFilter: 0,
        sortType: 'TRADE_PRICE',
        paymentPeriod: [],
        itemRegion: 1
      };
      const headers = {
        'accept': 'application/json',
        'content-type': 'application/json;charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      };
      const response = await axios.post(
        'http://localhost:4000/proxy',
        {
          url: BYBIT_API_URL,
          method: 'POST',
          data: payload,
          headers
        },
        { timeout: 10000 }
      );
      if (response.data?.result?.items) {
        return response.data.result.items.map((order: any) => transformOrder(order, asset, fiat));
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