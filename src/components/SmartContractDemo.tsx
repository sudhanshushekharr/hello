import React, { useState, useEffect } from 'react';
import { Campaign, Transaction, SmartContractState, SimulationStep } from '../types/simulation';
import CampaignCreator from './CampaignCreator';
import CampaignList from './CampaignList';
import TransactionLog from './TransactionLog';
import ContractVisualizer from './ContractVisualizer';
import BlockchainVisualizer from './BlockchainVisualizer';
import FundFlowAnimation from './FundFlowAnimation';
import CelebrationAnimation from './CelebrationAnimation';

const SmartContractDemo: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contractState, setContractState] = useState<SmartContractState>({
    totalCampaigns: 0,
    totalFundsRaised: 0,
    totalTransactions: 0,
    contractBalance: 0,
  });
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'campaigns' | 'transactions' | 'contract'>('create');
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
  const [latestTransaction, setLatestTransaction] = useState<Transaction | null>(null);
  const [achievementMessage, setAchievementMessage] = useState<string>('');

  // Animation states
  const [showBlockchainVisualizer, setShowBlockchainVisualizer] = useState(false);
  const [showFundFlow, setShowFundFlow] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [fundFlowData, setFundFlowData] = useState<{
    amount: number;
    fromType: 'donor' | 'campaign';
    toType: 'campaign' | 'creator';
  } | null>(null);
  const [celebrationData, setCelebrationData] = useState<{
    campaignTitle: string;
    amount: number;
  } | null>(null);

  // Initialize with sample data
  useEffect(() => {
    const sampleCampaign: Campaign = {
      id: '1',
      title: 'Eco-Friendly Water Bottles',
      description: 'Sustainable water bottles made from recycled materials to reduce plastic waste',
      goal: 10000,
      raised: 3500,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      creator: '0x1234...5678',
      isActive: true,
      backers: 12,
    };

    setCampaigns([sampleCampaign]);
    setContractState({
      totalCampaigns: 1,
      totalFundsRaised: 3500,
      totalTransactions: 12,
      contractBalance: 3500,
    });

    // Initialize simulation steps
    const steps: SimulationStep[] = [
      {
        id: '1',
        title: 'Deploy Smart Contract',
        description: 'Deploy the crowdfunding smart contract to the blockchain',
        action: 'Contract deployed with gas fee: 0.05 ETH',
        isComplete: true,
        result: 'Contract address: 0xABC...123',
      },
      {
        id: '2',
        title: 'Create Campaign',
        description: 'Campaign creator deploys a new funding campaign',
        action: 'Use the form to create your campaign',
        isComplete: false,
      },
      {
        id: '3',
        title: 'Make Donations',
        description: 'Supporters make donations to active campaigns',
        action: 'Click on campaigns to make donations',
        isComplete: false,
      },
      {
        id: '4',
        title: 'Automatic Execution',
        description: 'Smart contract automatically handles fund distribution',
        action: 'Watch automatic execution when goals are met',
        isComplete: false,
      },
    ];

    setSimulationSteps(steps);
  }, []);

  // Check for goal completion and handle automatic withdrawals
  useEffect(() => {
    campaigns.forEach(campaign => {
      if (campaign.raised >= campaign.goal && campaign.isActive) {
        // Trigger celebration animation
        setCelebrationData({
          campaignTitle: campaign.title,
          amount: campaign.raised
        });
        setShowCelebration(true);

        // Auto-complete campaign and create withdrawal transaction after celebration
        setTimeout(() => {
          setCampaigns(prev =>
            prev.map(c =>
              c.id === campaign.id ? { ...c, isActive: false } : c
            )
          );

          const withdrawalTransaction: Transaction = {
            id: Date.now().toString(),
            type: 'withdrawal',
            amount: campaign.raised,
            from: 'Smart Contract',
            to: campaign.creator,
            campaignId: campaign.id,
            timestamp: new Date(),
            gasUsed: 45000,
            gasPrice: 20,
            status: 'confirmed',
          };

          setTransactions(prev => [withdrawalTransaction, ...prev]);
          setContractState(prev => ({
            ...prev,
            contractBalance: prev.contractBalance - campaign.raised,
            totalTransactions: prev.totalTransactions + 1,
          }));

          // Show fund flow from campaign to creator
          setFundFlowData({
            amount: campaign.raised,
            fromType: 'campaign',
            toType: 'creator'
          });
          setShowFundFlow(true);

          // Update final simulation step
          setSimulationSteps(prev =>
            prev.map(step =>
              step.id === '4'
                ? { ...step, isComplete: true, result: `Automatic withdrawal of ${campaign.raised} ETH completed!` }
                : step
            )
          );
        }, 3000); // Wait for celebration to finish
      }
    });
  }, [campaigns]);

  const createCampaign = (campaignData: Omit<Campaign, 'id' | 'raised' | 'isActive' | 'backers'>) => {
    setIsProcessingTransaction(true);

    const newCampaign: Campaign = {
      ...campaignData,
      id: Date.now().toString(),
      raised: 0,
      isActive: true,
      backers: 0,
    };

    // Create transaction for campaign creation
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'donation',
      amount: 0,
      from: campaignData.creator,
      to: 'Smart Contract',
      campaignId: newCampaign.id,
      timestamp: new Date(),
      gasUsed: 150000,
      gasPrice: 20,
      status: 'pending',
    };

    setLatestTransaction(transaction);
    setTransactions(prev => [transaction, ...prev]);

    // Show blockchain visualization
    setShowBlockchainVisualizer(true);

    // Simulate blockchain processing time with visualization
    setTimeout(() => {
      setCampaigns(prev => [...prev, newCampaign]);
      setContractState(prev => ({
        ...prev,
        totalCampaigns: prev.totalCampaigns + 1,
      }));

      // Update transaction to confirmed
      setTransactions(prev =>
        prev.map(tx =>
          tx.id === transaction.id
            ? { ...tx, status: 'confirmed' as const }
            : tx
        )
      );

      // Update simulation step
      setSimulationSteps(prev =>
        prev.map(step =>
          step.id === '2'
            ? { ...step, isComplete: true, result: `Campaign "${newCampaign.title}" created successfully!` }
            : step
        )
      );

      setIsProcessingTransaction(false);
      
      // Auto-switch to campaigns tab to show the new campaign
      setTimeout(() => setActiveTab('campaigns'), 1000);
    }, 4000); // Wait for blockchain visualization to complete
  };

  const makeDonation = (campaignId: string, amount: number, donorAddress: string) => {
    setIsProcessingTransaction(true);

    // Simulate transaction pending state
    const pendingTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'donation',
      amount,
      from: donorAddress,
      to: campaignId,
      campaignId,
      timestamp: new Date(),
      gasUsed: 75000,
      gasPrice: 20,
      status: 'pending',
    };

    setTransactions(prev => [pendingTransaction, ...prev]);
    setLatestTransaction(pendingTransaction);

    // Show blockchain visualization for donation
    setShowBlockchainVisualizer(true);

    // Show fund flow animation from donor to campaign
    setFundFlowData({
      amount,
      fromType: 'donor',
      toType: 'campaign'
    });
    
    setTimeout(() => {
      setShowFundFlow(true);
    }, 1000);

    // Simulate blockchain confirmation delay
    setTimeout(() => {
      setCampaigns(prev =>
        prev.map(campaign =>
          campaign.id === campaignId
            ? {
                ...campaign,
                raised: campaign.raised + amount,
                backers: campaign.backers + 1,
              }
            : campaign
        )
      );

      // Update transaction to confirmed
      setTransactions(prev =>
        prev.map(tx =>
          tx.id === pendingTransaction.id
            ? { ...tx, status: 'confirmed' as const }
            : tx
        )
      );

      setContractState(prev => ({
        ...prev,
        totalFundsRaised: prev.totalFundsRaised + amount,
        totalTransactions: prev.totalTransactions + 1,
        contractBalance: prev.contractBalance + amount,
      }));

      // Update simulation step
      setSimulationSteps(prev =>
        prev.map(step =>
          step.id === '3'
            ? { ...step, isComplete: true, result: `Donation of ${amount} ETH processed successfully!` }
            : step
        )
      );

      setIsProcessingTransaction(false);
      setAchievementMessage(`✨ Donation successful! ${amount} ETH added to campaign.`);
      setTimeout(() => setAchievementMessage(''), 3000);
    }, 4000); // Wait for both animations to complete
  };

  const tabs = [
    { id: 'create' as const, label: 'Create Campaign', icon: '🚀', count: null },
    { id: 'campaigns' as const, label: 'Active Campaigns', icon: '📊', count: campaigns.filter(c => c.isActive).length },
    { id: 'transactions' as const, label: 'Transaction Log', icon: '📝', count: transactions.length },
    { id: 'contract' as const, label: 'Contract State', icon: '⚙️', count: null },
  ];

  return (
    <div className="space-y-6">
      {/* Achievement Banner */}
      {achievementMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg animate-slide-up">
          {achievementMessage}
        </div>
      )}

      {/* Animation Components */}
      <BlockchainVisualizer
        isActive={showBlockchainVisualizer}
        currentTransaction={latestTransaction}
        onComplete={() => {
          // Don't auto-close anymore, just notify completion
          // User can manually close or replay the animation
        }}
        onClose={() => setShowBlockchainVisualizer(false)}
      />

      <FundFlowAnimation
        isActive={showFundFlow}
        amount={fundFlowData?.amount || 0}
        fromType={fundFlowData?.fromType || 'donor'}
        toType={fundFlowData?.toType || 'campaign'}
        onComplete={() => {
          setShowFundFlow(false);
          setFundFlowData(null);
        }}
      />

      <CelebrationAnimation
        isActive={showCelebration}
        campaignTitle={celebrationData?.campaignTitle || ''}
        amount={celebrationData?.amount || 0}
        onComplete={() => {
          setShowCelebration(false);
          setCelebrationData(null);
        }}
      />

      {/* Processing Overlay (Simplified since we have blockchain visualizer) */}
      {isProcessingTransaction && !showBlockchainVisualizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Transaction</h3>
            <p className="text-gray-600 mb-4">Preparing blockchain visualization...</p>
          </div>
        </div>
      )}

      {/* Introduction */}
      <div className="card">
        <div className="flex items-start space-x-4">
          <div className="text-6xl animate-bounce-subtle">🎯</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Smart Contract Interaction Demo
            </h2>
            <p className="text-gray-600 mb-4">
              Experience how blockchain crowdfunding works! Create campaigns, make donations, 
              and watch smart contracts automatically handle the logic with complete transparency.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">🌟 Enhanced with Animations:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-blue-800 text-sm">
                <div>• 🌐 Live blockchain network visualization</div>
                <div>• 💰 Animated fund flow tracking</div>
                <div>• 🎉 Goal completion celebrations</div>
                <div>• ⚡ Real-time smart contract execution</div>
                <div>• 🔗 Interactive transaction broadcasting</div>
                <div>• ✨ Confetti & fireworks rewards</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Simulation Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 Blockchain Simulation Progress</h3>
        <div className="space-y-4">
          {simulationSteps.map((step, index) => (
            <div
              key={step.id}
              className={`relative p-4 rounded-lg border-2 transition-all duration-500 ${
                step.isComplete
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : isProcessingTransaction && index === simulationSteps.findIndex(s => !s.isComplete)
                  ? 'border-yellow-500 bg-yellow-50 animate-pulse'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step.isComplete 
                    ? 'bg-green-500 text-white scale-110' 
                    : isProcessingTransaction && index === simulationSteps.findIndex(s => !s.isComplete)
                    ? 'bg-yellow-500 text-white animate-pulse'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step.isComplete ? '✓' : index + 1}
                </div>
                <h4 className="ml-3 font-medium text-lg">{step.title}</h4>
                {step.isComplete && (
                  <div className="ml-auto text-green-500 text-2xl animate-bounce">✨</div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2 ml-11">{step.description}</p>
              <p className="text-sm font-medium text-gray-800 ml-11">{step.action}</p>
              {step.result && (
                <div className="mt-3 ml-11 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-700 animate-fade-in">
                  <strong>Result:</strong> {step.result}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 transform scale-105'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content with animations */}
      <div className="min-h-[400px] transition-all duration-300">
        <div className="animate-fade-in">
          {activeTab === 'create' && (
            <CampaignCreator onCreateCampaign={createCampaign} isProcessing={isProcessingTransaction} />
          )}
          {activeTab === 'campaigns' && (
            <CampaignList campaigns={campaigns} onDonate={makeDonation} isProcessing={isProcessingTransaction} />
          )}
          {activeTab === 'transactions' && (
            <TransactionLog transactions={transactions} latestTransaction={latestTransaction} />
          )}
          {activeTab === 'contract' && (
            <ContractVisualizer 
              contractState={contractState} 
              campaigns={campaigns}
              transactions={transactions}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartContractDemo; 