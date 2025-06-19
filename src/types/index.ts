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

export interface AmountTier {
  amount: number;
  label: string;
}

export const AMOUNT_TIERS: AmountTier[] = [
  { amount: 1000, label: '1K' },
  { amount: 5000, label: '5K' },
  { amount: 10000, label: '10K' },
  { amount: 50000, label: '50K' },
  { amount: 100000, label: '100K' },
  { amount: 500000, label: '500K' }
];

export const SUPPORTED_CURRENCIES = ['NGN', 'CNY', 'USD', 'EUR', 'GBP', 'INR'];
export const INTERMEDIARY_CURRENCIES = ['USDT', 'USDC', 'BUSD'];
export const PAYMENT_METHODS = ['Bank Transfer', 'Alipay', 'WeChat Pay', 'PayPal', 'Wise', 'Revolut'];