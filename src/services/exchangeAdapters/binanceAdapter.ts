import axios from 'axios';
import { ExchangeAdapter, P2POrder } from '../../types';

class BinanceAdapter implements ExchangeAdapter {
  name = 'Binance';
  private baseUrl = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
  private rateLimitDelay = 1000;
  private lastRequestTime = 0;

  async fetchP2POrders(asset: string, fiat: string, side: 'BUY' | 'SELL'): Promise<P2POrder[]> {
    try {
      await this.enforceRateLimit();
      
      const response = await axios.post(this.baseUrl, {
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
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      if (response.data?.success && response.data?.data) {
        return response.data.data.map((order: any) => this.transformOrder(order, asset, fiat));
      }
      
      return [];
    } catch (error) {
      console.error(`Binance API error for ${asset}/${fiat} ${side}:`, error);
      return [];
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    
    this.lastRequestTime = Date.now();
  }

  private transformOrder(order: any, asset: string, fiat: string): P2POrder {
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

  isAvailable(): boolean {
    return true;
  }
}

export default BinanceAdapter;