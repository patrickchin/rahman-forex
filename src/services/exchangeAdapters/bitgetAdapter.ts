import axios from 'axios';
import { ExchangeAdapter, P2POrder } from '../../types';

const BITGET_API_URL = 'https://www.bitget.com/v1/p2p/pub/adv/queryAdvList';

const bitgetAdapter: ExchangeAdapter = {
  name: 'Bitget',
  async fetchP2POrders(asset: string, fiat: string, side: 'BUY' | 'SELL'): Promise<P2POrder[]> {
    try {
      const payload = {
        side: side === 'BUY' ? 1 : 2,
        pageNo: 1,
        pageSize: 20,
        coinCode: asset,
        fiatCode: fiat,
        languageType: 0
      };
      const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      };
      const response = await axios.post(
        'http://localhost:4000/proxy',
        {
          url: BITGET_API_URL,
          method: 'POST',
          data: payload,
          headers
        },
        { timeout: 10000 }
      );
      if (response.data?.data?.dataList) {
        return response.data.data.dataList.map((order: any) => transformOrder(order, asset, fiat, side));
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
