import React, { useState } from 'react';
import { Campaign } from '../types/simulation';

interface CampaignListProps {
  campaigns: Campaign[];
  onDonate: (campaignId: string, amount: number, donorAddress: string) => void;
  isProcessing?: boolean;
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, onDonate, isProcessing = false }) => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donorAddress] = useState('0x' + Math.random().toString(16).substring(2, 10) + '...');

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const remaining = deadline.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'from-green-500 to-green-600';
    if (percentage >= 75) return 'from-blue-500 to-blue-600';
    if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const handleDonate = async (campaignId: string) => {
    const amount = parseFloat(donationAmount);
    if (!amount || amount <= 0 || isProcessing) return;

    onDonate(campaignId, amount, donorAddress);
    setDonationAmount('');
    setSelectedCampaign(null);
  };

  const suggestedAmounts = [0.1, 0.5, 1.0, 2.5];

  const activeCampaigns = campaigns.filter(campaign => campaign.isActive);

  if (activeCampaigns.length === 0) {
    return (
      <div className="card text-center">
        <div className="py-12">
          <div className="text-6xl mb-4 animate-bounce">🚀</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Campaigns</h3>
          <p className="text-gray-600 mb-4">
            Be the first to create a campaign and start raising funds!
          </p>
          <p className="text-sm text-gray-500">
            Switch to the "Create Campaign" tab to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            🎯 Active Campaigns ({activeCampaigns.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Support innovative projects with blockchain transparency
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Your wallet</div>
          <div className="font-mono bg-gray-100 px-3 py-1 rounded-lg text-sm">
            {donorAddress}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeCampaigns.map((campaign) => {
          const progressPercentage = getProgressPercentage(campaign.raised, campaign.goal);
          const isExpired = new Date(campaign.deadline) <= new Date();
          const isSelected = selectedCampaign === campaign.id;
          const isGoalReached = progressPercentage >= 100;

          return (
            <div 
              key={campaign.id} 
              className={`card transition-all duration-300 transform hover:scale-105 ${
                isSelected ? 'ring-2 ring-blue-500 shadow-2xl' : 'hover:shadow-xl'
              } ${isGoalReached ? 'bg-gradient-to-br from-green-50 to-emerald-50' : ''}`}
            >
              <div className="space-y-4">
                {/* Campaign Header */}
                <div className="relative">
                  {isGoalReached && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                      🎉 FUNDED!
                    </div>
                  )}
                  <h4 className="text-lg font-semibold text-gray-900 pr-8">{campaign.title}</h4>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">{campaign.description}</p>
                </div>

                {/* Progress Section */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Progress</span>
                    <span className={`font-bold ${isGoalReached ? 'text-green-600' : 'text-blue-600'}`}>
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="relative">
                    <div className="progress-bar h-4">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(progressPercentage)} transition-all duration-1000 ease-out relative overflow-hidden`}
                        style={{ width: `${progressPercentage}%` }}
                      >
                        {progressPercentage > 0 && (
                          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    {isGoalReached && (
                      <div className="absolute -top-1 -right-1 text-green-500 text-lg animate-bounce">
                        ✨
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      {campaign.raised} ETH raised
                    </span>
                    <span className="text-gray-700">
                      Goal: {campaign.goal} ETH
                    </span>
                  </div>
                  
                  <div className="text-center text-xs text-gray-500">
                    ≈ ${(campaign.raised * 2500).toLocaleString()} USD raised of ${(campaign.goal * 2500).toLocaleString()} USD goal
                  </div>
                </div>

                {/* Campaign Stats */}
                <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Backers</p>
                    <p className="font-semibold text-lg text-blue-600">{campaign.backers}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Avg Donation</p>
                    <p className="font-semibold text-lg text-purple-600">
                      {campaign.backers > 0 ? (campaign.raised / campaign.backers).toFixed(2) : '0'} ETH
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Time Left</p>
                    <p className={`font-semibold text-lg ${isExpired ? 'text-red-500' : 'text-green-600'}`}>
                      {formatTimeRemaining(campaign.deadline)}
                    </p>
                  </div>
                </div>

                {/* Action Section */}
                <div className="border-t border-gray-100 pt-4">
                  {!isSelected ? (
                    <button
                      onClick={() => setSelectedCampaign(campaign.id)}
                      disabled={isExpired || isGoalReached || isProcessing}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                        isExpired 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : isGoalReached
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : isProcessing
                          ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isExpired ? '⏰ Campaign Expired' : 
                       isGoalReached ? '🎉 Goal Reached!' : 
                       isProcessing ? '⏳ Processing...' : '💎 Support This Project'}
                    </button>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Choose Donation Amount (ETH)
                        </label>
                        
                        {/* Quick Amount Buttons */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {suggestedAmounts.map(amount => (
                            <button
                              key={amount}
                              onClick={() => setDonationAmount(amount.toString())}
                              className="py-2 px-3 text-sm border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
                              disabled={isProcessing}
                            >
                              {amount} ETH
                            </button>
                          ))}
                        </div>
                        
                        <input
                          type="number"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          step="0.01"
                          min="0"
                          placeholder="Enter custom amount"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          disabled={isProcessing}
                        />
                      </div>
                      
                      {donationAmount && parseFloat(donationAmount) > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 animate-slide-up">
                          <h5 className="font-semibold text-blue-900 mb-2">Transaction Preview</h5>
                          <div className="text-blue-800 text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Donation:</span>
                              <span className="font-mono">{donationAmount} ETH</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Gas fee:</span>
                              <span className="font-mono">~0.002 ETH</span>
                            </div>
                            <div className="flex justify-between">
                              <span>USD Value:</span>
                              <span>${(parseFloat(donationAmount) * 2500).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-blue-300 pt-1 flex justify-between font-semibold">
                              <span>Total Cost:</span>
                              <span className="font-mono">{(parseFloat(donationAmount) + 0.002).toFixed(3)} ETH</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setSelectedCampaign(null);
                            setDonationAmount('');
                          }}
                          disabled={isProcessing}
                          className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDonate(campaign.id)}
                          disabled={!donationAmount || parseFloat(donationAmount) <= 0 || isProcessing}
                          className={`flex-2 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                            !donationAmount || parseFloat(donationAmount) <= 0 || isProcessing
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transform hover:scale-105 shadow-lg'
                          }`}
                        >
                          {isProcessing ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            `🚀 Donate ${donationAmount || '0'} ETH`
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Campaign Footer */}
                <div className="text-xs text-gray-500 border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span>
                    Creator: <span className="font-mono text-blue-600">{campaign.creator}</span>
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    ID: #{campaign.id.slice(-4)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignList; 