import React, { useState } from 'react';
import { SmartContractState, Campaign, Transaction } from '../types/simulation';

interface ContractVisualizerProps {
  contractState: SmartContractState;
  campaigns: Campaign[];
  transactions: Transaction[];
}

const ContractVisualizer: React.FC<ContractVisualizerProps> = ({ 
  contractState, 
  campaigns, 
  transactions 
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'security' | 'performance'>('overview');

  const formatETH = (amount: number) => `${amount.toFixed(3)} ETH`;

  const getSuccessRate = () => {
    const confirmedTxs = transactions.filter(tx => tx.status === 'confirmed').length;
    return transactions.length > 0 ? (confirmedTxs / transactions.length) * 100 : 100;
  };

  const getAverageDonation = () => {
    const donations = transactions.filter(tx => tx.type === 'donation' && tx.amount > 0);
    if (donations.length === 0) return 0;
    return donations.reduce((sum, tx) => sum + tx.amount, 0) / donations.length;
  };

  const getActiveCampaigns = () => campaigns.filter(c => c.isActive);

  const getCompletedCampaigns = () => campaigns.filter(c => c.raised >= c.goal);

  const SecurityFeatureCard: React.FC<{ title: string; description: string; status: 'active' | 'secure' | 'verified' }> = ({ title, description, status }) => {
    const statusColors = {
      active: 'bg-green-50 border-green-200 text-green-800',
      secure: 'bg-blue-50 border-blue-200 text-blue-800',
      verified: 'bg-purple-50 border-purple-200 text-purple-800'
    };

    return (
      <div className={`p-4 rounded-lg border ${statusColors[status]}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">{title}</h4>
          <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50 font-medium uppercase">
            {status}
          </span>
        </div>
        <p className="text-sm">{description}</p>
      </div>
    );
  };

  const MetricCard: React.FC<{ title: string; value: string; change?: string; icon: string }> = ({ title, value, change, icon }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">{change}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Contract Overview', icon: '📊' },
            { id: 'security', label: 'Security Features', icon: '🔐' },
            { id: 'performance', label: 'Performance Metrics', icon: '⚡' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Campaigns"
              value={contractState.totalCampaigns.toString()}
              icon="🚀"
            />
            <MetricCard
              title="Funds Raised"
              value={formatETH(contractState.totalFundsRaised)}
              icon="💰"
            />
            <MetricCard
              title="Total Transactions"
              value={contractState.totalTransactions.toString()}
              icon="📝"
            />
            <MetricCard
              title="Contract Balance"
              value={formatETH(contractState.contractBalance)}
              icon="🏦"
            />
          </div>

          {/* Contract State Visualization */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Contract State</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Status */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Campaign Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-green-800">Active Campaigns</span>
                    <span className="font-semibold text-green-900">{getActiveCampaigns().length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-800">Completed Campaigns</span>
                    <span className="font-semibold text-blue-900">{getCompletedCampaigns().length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-800">Success Rate</span>
                    <span className="font-semibold text-gray-900">{((getCompletedCampaigns().length / Math.max(campaigns.length, 1)) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Fund Distribution */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Fund Distribution</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-800">Locked in Active Campaigns</span>
                    <span className="font-semibold text-yellow-900">
                      {formatETH(getActiveCampaigns().reduce((sum, c) => sum + c.raised, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-800">Available for Withdrawal</span>
                    <span className="font-semibold text-purple-900">
                      {formatETH(getCompletedCampaigns().reduce((sum, c) => sum + c.raised, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-800">Average Donation</span>
                    <span className="font-semibold text-gray-900">{formatETH(getAverageDonation())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Functions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Contract Functions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'createCampaign', description: 'Deploy a new funding campaign', gas: '~150,000', status: 'active' },
                { name: 'donate', description: 'Contribute funds to a campaign', gas: '~75,000', status: 'active' },
                { name: 'withdrawFunds', description: 'Withdraw funds from successful campaigns', gas: '~45,000', status: 'active' },
                { name: 'refund', description: 'Get refund from failed campaigns', gas: '~30,000', status: 'active' },
                { name: 'getCampaignInfo', description: 'Query campaign details', gas: '~5,000', status: 'active' },
                { name: 'emergencyStop', description: 'Pause contract in emergency', gas: '~25,000', status: 'standby' },
              ].map((func) => (
                <div key={func.name} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono text-primary-600">{func.name}()</code>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      func.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {func.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{func.description}</p>
                  <p className="text-xs text-gray-500">Gas: {func.gas}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeView === 'security' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Security Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SecurityFeatureCard
                title="Immutable Transactions"
                description="All donations and campaign data are permanently recorded on the blockchain"
                status="active"
              />
              <SecurityFeatureCard
                title="Decentralized Validation"
                description="Multiple network nodes validate every transaction before confirmation"
                status="verified"
              />
              <SecurityFeatureCard
                title="Transparent Operations"
                description="All contract operations are publicly visible and auditable"
                status="secure"
              />
              <SecurityFeatureCard
                title="Automatic Execution"
                description="Smart contracts execute automatically without human intervention"
                status="active"
              />
              <SecurityFeatureCard
                title="Fund Protection"
                description="Funds are locked in smart contracts until conditions are met"
                status="secure"
              />
              <SecurityFeatureCard
                title="No Central Authority"
                description="No single entity can control or manipulate the crowdfunding process"
                status="verified"
              />
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Security</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🔐</div>
                <h4 className="text-xl font-semibold text-gray-900">Transaction Success Rate</h4>
                <div className="text-3xl font-bold text-green-600 mt-2">{getSuccessRate().toFixed(1)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="text-gray-600">Confirmed</p>
                  <p className="font-semibold text-green-600">
                    {transactions.filter(tx => tx.status === 'confirmed').length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Pending</p>
                  <p className="font-semibold text-yellow-600">
                    {transactions.filter(tx => tx.status === 'pending').length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Failed</p>
                  <p className="font-semibold text-red-600">
                    {transactions.filter(tx => tx.status === 'failed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeView === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Avg Transaction Time"
              value="2.3s"
              change="+15% faster"
              icon="⚡"
            />
            <MetricCard
              title="Gas Efficiency"
              value="94.2%"
              change="+5% optimized"
              icon="⛽"
            />
            <MetricCard
              title="Network Utilization"
              value="78%"
              icon="🌐"
            />
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gas Usage Analytics</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">💰</div>
                  <p className="text-sm text-gray-600">Total Gas Spent</p>
                  <p className="text-lg font-semibold">
                    {transactions.reduce((sum, tx) => sum + (tx.gasUsed * tx.gasPrice) / 1e9, 0).toFixed(6)} ETH
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm text-gray-600">Avg Gas per Tx</p>
                  <p className="text-lg font-semibold">
                    {transactions.length > 0 ? Math.round(transactions.reduce((sum, tx) => sum + tx.gasUsed, 0) / transactions.length) : 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">🎯</div>
                  <p className="text-sm text-gray-600">Efficiency Score</p>
                  <p className="text-lg font-semibold">A+</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Transaction Throughput</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current TPS</span>
                    <span className="font-medium">15.3</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '61%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>25 TPS</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Block Confirmation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Block Time</span>
                    <span className="font-medium">12.1s</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '85%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Fast</span>
                    <span>Slow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractVisualizer; 