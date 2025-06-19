import React, { useState } from 'react';
import { ArbitrageOpportunity, FilterOptions, AMOUNT_TIERS } from '../types';
import { ArrowUpDown, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface ArbitrageTableProps {
  opportunities: ArbitrageOpportunity[];
  filters: FilterOptions;
  isLoading: boolean;
}

type SortField = 'profitPercentage' | 'tier' | 'sourceRate' | 'targetRate' | 'timestamp';
type SortDirection = 'asc' | 'desc';

const ArbitrageTable: React.FC<ArbitrageTableProps> = ({ opportunities, filters, isLoading }) => {
  const [sortField, setSortField] = useState<SortField>('profitPercentage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (opp.profitPercentage < filters.minProfit) return false;
    if (opp.minAmount > filters.maxAmount || opp.maxAmount < filters.minAmount) return false;
    if (filters.exchanges.length > 0 && 
        !filters.exchanges.includes(opp.sourceExchange) && 
        !filters.exchanges.includes(opp.targetExchange)) return false;
    if (filters.paymentMethods.length > 0 && 
        !opp.paymentMethods.some(method => filters.paymentMethods.includes(method))) return false;
    return true;
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getProfitColor = (profit: number) => {
    if (profit >= 2) return 'text-success-600 dark:text-success-400';
    if (profit >= 1) return 'text-warning-600 dark:text-warning-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTierLabel = (tier: number) => {
    const tierObj = AMOUNT_TIERS.find(t => t.amount === tier);
    return tierObj ? tierObj.label : tier.toString();
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading opportunities...</span>
        </div>
      </div>
    );
  }

  if (sortedOpportunities.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-8">
        <div className="text-center">
          <TrendingDown className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No opportunities found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your filters or currency selection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Arbitrage Opportunities ({sortedOpportunities.length})
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
          <thead className="bg-gray-50 dark:bg-dark-700">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-600"
                onClick={() => handleSort('tier')}
              >
                <div className="flex items-center space-x-1">
                  <span>Tier</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Route
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-600"
                onClick={() => handleSort('sourceRate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Source Rate</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-600"
                onClick={() => handleSort('targetRate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Target Rate</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-600"
                onClick={() => handleSort('profitPercentage')}
              >
                <div className="flex items-center space-x-1">
                  <span>Profit</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Limits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment Methods
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
            {sortedOpportunities.map((opportunity) => (
              <tr key={opportunity.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {getTierLabel(opportunity.tier)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white font-medium">
                    {opportunity.sourceCurrency} → {opportunity.targetCurrency}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    via {opportunity.intermediaryCurrency}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {opportunity.sourceExchange} → {opportunity.targetExchange}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(opportunity.sourceRate, opportunity.sourceCurrency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(opportunity.targetRate, opportunity.targetCurrency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <TrendingUp className={clsx('w-4 h-4 mr-1', getProfitColor(opportunity.profitPercentage))} />
                    <span className={clsx('text-sm font-medium', getProfitColor(opportunity.profitPercentage))}>
                      {formatPercentage(opportunity.profitPercentage)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div>{formatCurrency(opportunity.minAmount, opportunity.sourceCurrency)} - {formatCurrency(opportunity.maxAmount, opportunity.sourceCurrency)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {opportunity.paymentMethods.slice(0, 2).map((method) => (
                      <span key={method} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {method}
                      </span>
                    ))}
                    {opportunity.paymentMethods.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        +{opportunity.paymentMethods.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 flex items-center space-x-1">
                    <ExternalLink className="w-4 h-4" />
                    <span>Trade</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArbitrageTable;