import { P2POrder, ArbitrageOpportunity, AMOUNT_TIERS } from '../types';
import exchangeRegistry from './exchangeRegistry';

class ArbitrageCalculator {
  private cache: Map<string, P2POrder[]> = new Map();
  private cacheExpiry = 30000; // 30 seconds

  async calculateArbitrageOpportunities(
    sourceCurrency: string,
    targetCurrency: string,
    intermediaryCurrency: string = 'USDT'
  ): Promise<ArbitrageOpportunity[]> {
    const opportunities: ArbitrageOpportunity[] = [];
    const adapters = exchangeRegistry.getAllAdapters();

    try {
      // Fetch all required order data
      const sourceOrders = await this.fetchAllOrders(intermediaryCurrency, sourceCurrency, 'SELL');
      const targetOrders = await this.fetchAllOrders(intermediaryCurrency, targetCurrency, 'BUY');

      // Calculate opportunities for each amount tier
      for (const tier of AMOUNT_TIERS) {
        const tierOpportunities = this.calculateTierOpportunities(
          sourceOrders,
          targetOrders,
          sourceCurrency,
          targetCurrency,
          intermediaryCurrency,
          tier.amount,
          tier.label
        );
        opportunities.push(...tierOpportunities);
      }

      return opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
    } catch (error) {
      console.error('Error calculating arbitrage opportunities:', error);
      return [];
    }
  }

  private async fetchAllOrders(asset: string, fiat: string, side: 'BUY' | 'SELL'): Promise<P2POrder[]> {
    const cacheKey = `${asset}-${fiat}-${side}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached[0]?.timestamp)) {
      return cached;
    }

    const allOrders: P2POrder[] = [];
    const adapters = exchangeRegistry.getAllAdapters();

    await Promise.allSettled(
      adapters.map(async (adapter) => {
        try {
          const orders = await adapter.fetchP2POrders(asset, fiat, side);
          allOrders.push(...orders);
        } catch (error) {
          console.error(`Error fetching from ${adapter.name}:`, error);
        }
      })
    );

    this.cache.set(cacheKey, allOrders);
    return allOrders;
  }

  private calculateTierOpportunities(
    sourceOrders: P2POrder[],
    targetOrders: P2POrder[],
    sourceCurrency: string,
    targetCurrency: string,
    intermediaryCurrency: string,
    amount: number,
    tierLabel: string
  ): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];

    // Find best rates for the given amount
    const validSourceOrders = sourceOrders.filter(order => 
      order.minAmount <= amount && order.maxAmount >= amount && order.availableAmount >= amount
    );

    const validTargetOrders = targetOrders.filter(order => 
      order.minAmount <= amount && order.maxAmount >= amount && order.availableAmount >= amount
    );

    for (const sourceOrder of validSourceOrders) {
      for (const targetOrder of validTargetOrders) {
        if (sourceOrder.exchange === targetOrder.exchange) continue;

        const sourceRate = sourceOrder.price; // NGN per USDT
        const targetRate = targetOrder.price; // CNY per USDT

        // Calculate cross rate: NGN -> USDT -> CNY
        const crossRate = sourceRate / targetRate;
        const directRate = this.getDirectRate(sourceCurrency, targetCurrency);
        
        if (directRate > 0) {
          const profitMargin = crossRate - directRate;
          const profitPercentage = (profitMargin / directRate) * 100;

          if (profitPercentage > 0.1) { // Minimum 0.1% profit
            const commonPaymentMethods = this.findCommonPaymentMethods(
              sourceOrder.paymentMethods,
              targetOrder.paymentMethods
            );

            opportunities.push({
              id: `${sourceOrder.id}-${targetOrder.id}-${amount}`,
              sourceCurrency,
              targetCurrency,
              intermediaryCurrency,
              sourceExchange: sourceOrder.exchange,
              targetExchange: targetOrder.exchange,
              sourceRate,
              targetRate,
              profitMargin,
              profitPercentage,
              minAmount: Math.max(sourceOrder.minAmount, targetOrder.minAmount),
              maxAmount: Math.min(sourceOrder.maxAmount, targetOrder.maxAmount, sourceOrder.availableAmount, targetOrder.availableAmount),
              paymentMethods: commonPaymentMethods,
              timestamp: Date.now(),
              tier: amount,
              route: `${sourceCurrency} → ${intermediaryCurrency} (${sourceOrder.exchange}) → ${targetCurrency} (${targetOrder.exchange})`
            });
          }
        }
      }
    }

    return opportunities;
  }

  private getDirectRate(from: string, to: string): number {
    // Mock direct rates - in production, fetch from forex APIs
    const rates: Record<string, number> = {
      'NGN-CNY': 0.0175,
      'CNY-NGN': 57.14,
      'NGN-USD': 0.0013,
      'USD-NGN': 769.23,
      'CNY-USD': 0.14,
      'USD-CNY': 7.14
    };
    
    return rates[`${from}-${to}`] || 0;
  }

  private findCommonPaymentMethods(methods1: string[], methods2: string[]): string[] {
    return methods1.filter(method => methods2.includes(method));
  }

  private isCacheValid(timestamp: number): boolean {
    return timestamp && (Date.now() - timestamp) < this.cacheExpiry;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default new ArbitrageCalculator();