import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CurrencySelector from './components/CurrencySelector';
import FilterPanel from './components/FilterPanel';
import StatsCards from './components/StatsCards';
import ArbitrageTable from './components/ArbitrageTable';
import arbitrageCalculator from './services/arbitrageCalculator';
import exchangeRegistry from './services/exchangeRegistry';
import { ArbitrageOpportunity, FilterOptions, MarketStats } from './types';

function App() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [sourceCurrency, setSourceCurrency] = useState('NGN');
  const [targetCurrency, setTargetCurrency] = useState('CNY');
  const [intermediaryCurrency, setIntermediaryCurrency] = useState('USDT');
  const [filters, setFilters] = useState<FilterOptions>({
    minProfit: 0.1,
    maxSpread: 10,
    paymentMethods: [],
    exchanges: exchangeRegistry.getAdapterNames(),
    minAmount: 1000,
    maxAmount: 1000000
  });

  const calculateStats = useCallback((opportunities: ArbitrageOpportunity[]): MarketStats => {
    if (opportunities.length === 0) {
      return {
        totalOpportunities: 0,
        averageProfit: 0,
        bestOpportunity: null,
        lastUpdate
      };
    }

    const totalProfit = opportunities.reduce((sum, opp) => sum + opp.profitPercentage, 0);
    const averageProfit = totalProfit / opportunities.length;
    const bestOpportunity = opportunities.reduce((best, current) => 
      current.profitPercentage > best.profitPercentage ? current : best
    );

    return {
      totalOpportunities: opportunities.length,
      averageProfit,
      bestOpportunity,
      lastUpdate
    };
  }, [lastUpdate]);

  const fetchOpportunities = useCallback(async () => {
    if (sourceCurrency === targetCurrency) return;
    
    setIsLoading(true);
    try {
      const newOpportunities = await arbitrageCalculator.calculateArbitrageOpportunities(
        sourceCurrency,
        targetCurrency,
        intermediaryCurrency
      );
      setOpportunities(newOpportunities);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sourceCurrency, targetCurrency, intermediaryCurrency]);

  const handleRefresh = useCallback(() => {
    arbitrageCalculator.clearCache();
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Initial load and auto-refresh
  useEffect(() => {
    fetchOpportunities();
    
    const interval = setInterval(() => {
      fetchOpportunities();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [fetchOpportunities]);

  // Update filters when exchanges change
  useEffect(() => {
    const availableExchanges = exchangeRegistry.getAdapterNames();
    setFilters(prev => ({
      ...prev,
      exchanges: prev.exchanges.filter(ex => availableExchanges.includes(ex))
    }));
  }, []);

  const stats = calculateStats(opportunities);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Header 
        onRefresh={handleRefresh}
        isLoading={isLoading}
        lastUpdate={lastUpdate}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <CurrencySelector
            sourceCurrency={sourceCurrency}
            targetCurrency={targetCurrency}
            intermediaryCurrency={intermediaryCurrency}
            onSourceChange={setSourceCurrency}
            onTargetChange={setTargetCurrency}
            onIntermediaryChange={setIntermediaryCurrency}
          />
          
          <StatsCards stats={stats} />
          
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
          />
          
          <ArbitrageTable
            opportunities={opportunities}
            filters={filters}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}

export default App;