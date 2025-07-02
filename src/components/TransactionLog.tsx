import React, { useState, useEffect } from 'react';
import { Transaction } from '../types/simulation';

interface TransactionLogProps {
  transactions: Transaction[];
  latestTransaction?: Transaction | null;
}

const TransactionLog: React.FC<TransactionLogProps> = ({ transactions, latestTransaction }) => {
  const [filter, setFilter] = useState<'all' | 'donation' | 'withdrawal' | 'refund'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount'>('newest');
  const [highlightedTx, setHighlightedTx] = useState<string | null>(null);

  // Highlight latest transaction
  useEffect(() => {
    if (latestTransaction) {
      setHighlightedTx(latestTransaction.id);
      const timer = setTimeout(() => setHighlightedTx(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [latestTransaction]);

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    if (address === 'Smart Contract') return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getGasCost = (gasUsed: number, gasPrice: number) => {
    return (gasUsed * gasPrice) / 1e9; // Convert to ETH
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'donation': return '💰';
      case 'withdrawal': return '📤';
      case 'refund': return '↩️';
    }
  };

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'donation': return 'text-blue-600 bg-blue-50';
      case 'withdrawal': return 'text-green-600 bg-green-50';
      case 'refund': return 'text-orange-600 bg-orange-50';
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.type === filter
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case 'newest': return b.timestamp.getTime() - a.timestamp.getTime();
      case 'oldest': return a.timestamp.getTime() - b.timestamp.getTime();
      case 'amount': return b.amount - a.amount;
      default: return 0;
    }
  });

  const totalGasUsed = transactions.reduce((sum, tx) => sum + getGasCost(tx.gasUsed, tx.gasPrice), 0);
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  if (transactions.length === 0) {
    return (
      <div className="card text-center">
        <div className="py-12">
          <div className="text-6xl mb-4 animate-bounce">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
          <p className="text-gray-600 mb-4">
            Transaction history will appear here as you interact with campaigns.
          </p>
          <p className="text-sm text-gray-500">
            Create a campaign or make a donation to see transactions in action!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center">
            <div className="text-3xl mr-4 animate-bounce">📊</div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-900">{transactions.length}</p>
              <p className="text-xs text-blue-500">
                {transactions.filter(tx => tx.status === 'confirmed').length} confirmed
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center">
            <div className="text-3xl mr-4 animate-pulse">⛽</div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Gas Used</p>
              <p className="text-2xl font-bold text-purple-900">{totalGasUsed.toFixed(6)} ETH</p>
              <p className="text-xs text-purple-500">
                ≈ ${(totalGasUsed * 2500).toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center">
            <div className="text-3xl mr-4 animate-bounce-subtle">💸</div>
            <div>
              <p className="text-sm text-green-600 font-medium">Total Volume</p>
              <p className="text-2xl font-bold text-green-900">{totalVolume.toFixed(3)} ETH</p>
              <p className="text-xs text-green-500">
                ≈ ${(totalVolume * 2500).toFixed(0)} USD
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Controls */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Transactions ({transactions.length})</option>
                <option value="donation">Donations ({transactions.filter(tx => tx.type === 'donation').length})</option>
                <option value="withdrawal">Withdrawals ({transactions.filter(tx => tx.type === 'withdrawal').length})</option>
                <option value="refund">Refunds ({transactions.filter(tx => tx.type === 'refund').length})</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount">Amount (High to Low)</option>
              </select>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Showing {sortedTransactions.length} of {transactions.length} transactions
            </div>
            <div className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Transaction List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">🔗</span>
          Blockchain Transaction History
        </h3>
        
        <div className="space-y-3">
          {sortedTransactions.map((tx, index) => (
            <div 
              key={tx.id} 
              className={`border rounded-lg p-4 transition-all duration-300 ${
                highlightedTx === tx.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-3xl">{getTypeIcon(tx.type)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900 capitalize">{tx.type}</h4>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(tx.status)}`}>
                        {tx.status}
                        {tx.status === 'pending' && (
                          <span className="ml-1 animate-spin">⏳</span>
                        )}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(tx.type)}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">From:</span> 
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                          {formatAddress(tx.from)}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">To:</span> 
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                          {formatAddress(tx.to)}
                        </span>
                      </div>
                      <p className="flex items-center space-x-2">
                        <span className="font-medium">Time:</span> 
                        <span>{formatDate(tx.timestamp)}</span>
                        {highlightedTx === tx.id && (
                          <span className="text-blue-600 text-xs animate-pulse">● LATEST</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-xl font-bold text-gray-900">
                    {tx.amount > 0 ? (
                      <span className="text-green-600">+{tx.amount} ETH</span>
                    ) : (
                      <span className="text-gray-500">Contract Call</span>
                    )}
                  </div>
                  {tx.amount > 0 && (
                    <div className="text-sm text-gray-500">
                      ≈ ${(tx.amount * 2500).toFixed(2)} USD
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    Gas: {getGasCost(tx.gasUsed, tx.gasPrice).toFixed(6)} ETH
                  </div>
                  <div className="text-xs text-gray-400">
                    Block #{Math.floor(Date.now() / 1000) + index}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Transaction Details */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 mb-1">Gas Used</p>
                    <p className="font-medium text-blue-600">{tx.gasUsed.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 mb-1">Gas Price</p>
                    <p className="font-medium text-purple-600">{tx.gasPrice} Gwei</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 mb-1">Transaction Hash</p>
                    <p className="font-mono text-blue-600">0x{tx.id.substring(0, 8)}...</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 mb-1">Campaign ID</p>
                    <p className="font-mono text-green-600">#{tx.campaignId.slice(-4)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {sortedTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-500 mb-2">No transactions match the current filter.</p>
            <button
              onClick={() => setFilter('all')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Show all transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionLog; 