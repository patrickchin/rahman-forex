import React from 'react';
import { FilterOptions, PAYMENT_METHODS } from '../types';
import exchangeRegistry from '../services/exchangeRegistry';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const exchanges = exchangeRegistry.getAdapterNames();

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Filters
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Min Profit (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={filters.minProfit}
            onChange={(e) => updateFilter('minProfit', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Spread (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={filters.maxSpread}
            onChange={(e) => updateFilter('maxSpread', parseFloat(e.target.value) || 100)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Min Amount
          </label>
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) => updateFilter('minAmount', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Amount
          </label>
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => updateFilter('maxAmount', parseInt(e.target.value) || 1000000)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Exchanges
          </label>
          <div className="space-y-2">
            {exchanges.map(exchange => (
              <label key={exchange} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.exchanges.includes(exchange)}
                  onChange={(e) => updateFilter('exchanges', toggleArrayItem(filters.exchanges, exchange))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {exchange}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Payment Methods
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {PAYMENT_METHODS.map(method => (
              <label key={method} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.paymentMethods.includes(method)}
                  onChange={(e) => updateFilter('paymentMethods', toggleArrayItem(filters.paymentMethods, method))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {method}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;