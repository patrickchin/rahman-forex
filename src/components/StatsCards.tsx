import React from 'react';
import { TrendingUp, DollarSign, Activity, Clock } from 'lucide-react';
import { MarketStats } from '../types';

interface StatsCardsProps {
  stats: MarketStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Opportunities
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalOpportunities}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Average Profit
            </p>
            <p className="text-2xl font-bold text-success-600 dark:text-success-400">
              {formatPercentage(stats.averageProfit)}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg">
            <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Best Opportunity
            </p>
            <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
              {stats.bestOpportunity ? formatPercentage(stats.bestOpportunity.profitPercentage) : 'N/A'}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-lg">
            <DollarSign className="w-6 h-6 text-warning-600 dark:text-warning-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Last Update
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatTime(stats.lastUpdate)}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;