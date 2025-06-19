export interface P2POrder {
  id: string;
  exchange: string;
  asset: string;
  fiatCurrency: string;
  side: 'BUY' | 'SELL';
  price: number;
  minAmount: number;
  maxAmount: number;
  availableAmount: number;
  paymentMethods: string[];
  merchantName: string;
  completionRate: number;
  orderCount: number;
  timestamp: number;
}

export interface ArbitrageOpportunity {
  id: string;
  sourceCurrency: string;
  targetCurrency: string;
  intermediaryCurrency: string;
  sourceExchange: string;
  targetExchange: string;
  sourceRate: number;
  targetRate: number;
  profitMargin: number;
  profitPercentage: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
  timestamp: number;
  tier: number;
  route: string;
}

export interface ExchangeAdapter {
  name: string;
  fetchP2POrders(asset: string, fiat: string, side: 'BUY' | 'SELL'): Promise<P2POrder[]>;
  isAvailable(): boolean;
}

export interface CurrencyPair {
  base: string;
  quote: string;
  label: string;
}

export interface FilterOptions {
  minProfit: number;
  maxSpread: number;
  paymentMethods: string[];
  exchanges: string[];
  minAmount: number;
  maxAmount: number;
}

export interface MarketStats {
  totalOpportunities: number;
  averageProfit: number;
  bestOpportunity: ArbitrageOpportunity | null;
  lastUpdate: number;
}