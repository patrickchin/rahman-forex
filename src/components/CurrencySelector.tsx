import React from 'react';
import { SUPPORTED_CURRENCIES, INTERMEDIARY_CURRENCIES } from '../types';

interface CurrencySelectorProps {
  sourceCurrency: string;
  targetCurrency: string;
  intermediaryCurrency: string;
  onSourceChange: (currency: string) => void;
  onTargetChange: (currency: string) => void;
  onIntermediaryChange: (currency: string) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  sourceCurrency,
  targetCurrency,
  intermediaryCurrency,
  onSourceChange,
  onTargetChange,
  onIntermediaryChange
}) => {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Currency Selection
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Source Currency
          </label>
          <select
            value={sourceCurrency}
            onChange={(e) => onSourceChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {SUPPORTED_CURRENCIES.map(currency => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Intermediary Currency
          </label>
          <select
            value={intermediaryCurrency}
            onChange={(e) => onIntermediaryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {INTERMEDIARY_CURRENCIES.map(currency => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Currency
          </label>
          <select
            value={targetCurrency}
            onChange={(e) => onTargetChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {SUPPORTED_CURRENCIES.filter(c => c !== sourceCurrency).map(currency => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CurrencySelector;