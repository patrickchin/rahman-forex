import axios from 'axios';
import { ExchangeAdapter, P2POrder } from '../../types';

class BybitAdapter implements ExchangeAdapter {
  name = 'Bybit';
  private baseUrl = 'https://api2.bybit.com/fiat/otc/item/online';
  private rateLimitDelay = 1200;
  private lastRequestTime = 0;

  async fetchP2POrders(asset: string, fiat: string, side: 'BUY' | 'SELL'): Promise<P2POrder[]> {
    try {
      await this.enforceRateLimit();
      
      const response = await axios.get(this.baseUrl, {
        params: {
          userId: '',
          tokenId: asset,
          currencyId: fiat,
          payment: '',
          side: side === 'BUY' ? '1' : '0',
          size: '20',
          page: '1',
          amount: ''
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      if (response.data?.result?.items) {
        return response.data.result.items.map((order: any) => this.transformOrder(order, asset, fiat));
      }
      
      return [];
    } catch (error) {
      console.error(`Bybit API error for ${asset}/${fiat} ${side}:`, error);
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

  isAvailable(): boolean {
    return true;
  }
}

export default BybitAdapter;