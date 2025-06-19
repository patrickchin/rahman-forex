import { ExchangeAdapter } from '../types';
import BinanceAdapter from './exchangeAdapters/binanceAdapter';
import BybitAdapter from './exchangeAdapters/bybitAdapter';

class ExchangeRegistry {
  private adapters: Map<string, ExchangeAdapter> = new Map();

  constructor() {
    this.registerAdapter(new BinanceAdapter());
    this.registerAdapter(new BybitAdapter());
  }

  registerAdapter(adapter: ExchangeAdapter): void {
    this.adapters.set(adapter.name.toLowerCase(), adapter);
  }

  getAdapter(name: string): ExchangeAdapter | undefined {
    return this.adapters.get(name.toLowerCase());
  }

  getAllAdapters(): ExchangeAdapter[] {
    return Array.from(this.adapters.values()).filter(adapter => adapter.isAvailable());
  }

  getAdapterNames(): string[] {
    return this.getAllAdapters().map(adapter => adapter.name);
  }
}

export default new ExchangeRegistry();