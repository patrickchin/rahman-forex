import axios from 'axios';
import { ExchangeAdapter, P2POrder } from '../../types';

const BINANCE_API_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';

const binanceAdapter: ExchangeAdapter = {
  name: 'Binance',
  async fetchP2POrders(asset: string, fiat: string, side: 'BUY' | 'SELL'): Promise<P2POrder[]> {
    try {
      const response = await axios.post(
        'http://localhost:4000/proxy',
        {
          url: BINANCE_API_URL,
          method: 'POST',
          data: {
            fiat,
            page: 1,
            rows: 20,
            tradeType: side,
            asset,
            countries: [],
            proMerchantAds: false,
            shieldMerchantAds: false,
            filterType: "all",
            periods: [],
            additionalKycVerifyFilter: 0,
            publisherType: null,
            payTypes: [],
            classifies: ["mass", "profession"]
          },
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        },
        { timeout: 10000 }
      );
      if (response.data?.success && response.data?.data) {
        return response.data.data.map((order: any) => transformOrder(order, asset, fiat));
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