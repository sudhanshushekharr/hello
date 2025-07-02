import React, { useState } from 'react';
import { Campaign } from '../types/simulation';

interface CampaignCreatorProps {
  onCreateCampaign: (campaign: Omit<Campaign, 'id' | 'raised' | 'isActive' | 'backers'>) => void;
  isProcessing?: boolean;
}

const CampaignCreator: React.FC<CampaignCreatorProps> = ({ onCreateCampaign, isProcessing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
    creator: '0x' + Math.random().toString(16).substring(2, 10) + '...', // Mock wallet address
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [estimatedGas, setEstimatedGas] = useState<number>(0.003); // ETH
  const [previewMode, setPreviewMode] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Campaign title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Campaign description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    if (!formData.goal || parseFloat(formData.goal) <= 0) {
      newErrors.goal = 'Goal must be greater than 0';
    } else if (parseFloat(formData.goal) > 1000000) {
      newErrors.goal = 'Goal seems unrealistic (max 1M ETH)';
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
      
      if (deadlineDate <= now) {
        newErrors.deadline = 'Deadline must be in the future';
      } else if (deadlineDate > maxDate) {
        newErrors.deadline = 'Deadline cannot be more than 1 year from now';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isProcessing) return;

    const campaign: Omit<Campaign, 'id' | 'raised' | 'isActive' | 'backers'> = {
      title: formData.title,
      description: formData.description,
      goal: parseFloat(formData.goal),
      deadline: new Date(formData.deadline),
      creator: formData.creator,
    };

    onCreateCampaign(campaign);
    
    // Reset form after successful creation
    setTimeout(() => {
      if (!isProcessing) {
        setFormData({
          title: '',
          description: '',
          goal: '',
          deadline: '',
          creator: '0x' + Math.random().toString(16).substring(2, 10) + '...',
        });
        setPreviewMode(false);
      }
    }, 3500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update gas estimation based on content complexity
    if (field === 'description' || field === 'title') {
      const complexity = (formData.title.length + formData.description.length) / 100;
      setEstimatedGas(0.003 + complexity * 0.001);
    }
  };

  const isFormValid = () => {
    return formData.title && formData.description && formData.goal && formData.deadline && Object.keys(errors).length === 0;
  };

  const calculateDaysUntilDeadline = () => {
    if (!formData.deadline) return 0;
    const deadline = new Date(formData.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">🚀 Create New Campaign</h3>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200"
            disabled={!isFormValid()}
          >
            {previewMode ? '📝 Edit' : '👁️ Preview'}
          </button>
        </div>
        
        {!previewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Revolutionary Solar Panel Project"
                  disabled={isProcessing}
                  maxLength={100}
                />
                <div className="absolute top-2 right-2 text-xs text-gray-400">
                  {formData.title.length}/100
                </div>
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1 animate-slide-up">{errors.title}</p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Describe your project, goals, and how the funds will be used..."
                  disabled={isProcessing}
                  maxLength={500}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {formData.description.length}/500
                </div>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1 animate-slide-up">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Goal (ETH) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="goal"
                      value={formData.goal}
                      onChange={(e) => handleInputChange('goal', e.target.value)}
                      step="0.01"
                      min="0"
                      max="1000000"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.goal ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      disabled={isProcessing}
                    />
                    {formData.goal && (
                      <div className="absolute right-3 top-3 text-sm text-gray-500">
                        ≈ ${(parseFloat(formData.goal) * 2500).toLocaleString()} USD
                      </div>
                    )}
                  </div>
                  {errors.goal && (
                    <p className="text-red-500 text-sm mt-1 animate-slide-up">{errors.goal}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="deadline"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.deadline ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isProcessing}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {formData.deadline && (
                    <p className="text-sm text-blue-600 mt-1">
                      Duration: {calculateDaysUntilDeadline()} days
                    </p>
                  )}
                  {errors.deadline && (
                    <p className="text-red-500 text-sm mt-1 animate-slide-up">{errors.deadline}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creator Address
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.creator}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      creator: '0x' + Math.random().toString(16).substring(2, 10) + '...' 
                    }))}
                    className="px-3 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                    disabled={isProcessing}
                  >
                    🔄
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid() || isProcessing}
                className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-200 ${
                  !isFormValid() || isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Broadcasting to Blockchain...
                  </div>
                ) : (
                  '🚀 Deploy Campaign to Blockchain'
                )}
              </button>
            </form>

            {/* Enhanced Info Panel */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">⛽</span>
                  Gas Estimation
                </h4>
                <div className="space-y-2 text-yellow-800 text-sm">
                  <div className="flex justify-between">
                    <span>Base deployment cost:</span>
                    <span className="font-mono">0.003 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data complexity fee:</span>
                    <span className="font-mono">+{(estimatedGas - 0.003).toFixed(6)} ETH</span>
                  </div>
                  <div className="border-t border-yellow-300 pt-2 flex justify-between font-semibold">
                    <span>Total estimated cost:</span>
                    <span className="font-mono">{estimatedGas.toFixed(6)} ETH</span>
                  </div>
                  <div className="text-xs text-yellow-700">
                    ≈ ${(estimatedGas * 2500).toFixed(2)} USD
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">🔗</span>
                  Smart Contract Process
                </h4>
                <ol className="text-blue-800 text-sm space-y-2 list-decimal list-inside">
                  <li>Validate campaign parameters</li>
                  <li>Deploy campaign to blockchain</li>
                  <li>Generate unique campaign ID</li>
                  <li>Set up automatic fund management</li>
                  <li>Enable public donation tracking</li>
                  <li>Schedule deadline enforcement</li>
                </ol>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">🛡️</span>
                  Security Features
                </h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Immutable campaign parameters</li>
                  <li>• Automatic fund escrow</li>
                  <li>• Transparent donation tracking</li>
                  <li>• Time-locked withdrawals</li>
                  <li>• Decentralized validation</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // Preview Mode
          <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">{formData.title}</h4>
              <p className="text-gray-600 mb-4">{formData.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{formData.goal} ETH</div>
                  <div className="text-sm text-gray-600">Funding Goal</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{calculateDaysUntilDeadline()}</div>
                  <div className="text-sm text-gray-600">Days to Raise</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">0%</div>
                  <div className="text-sm text-gray-600">Funded</div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mb-4">
                Creator: <span className="font-mono">{formData.creator}</span>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                🚀 Launch This Campaign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCreator; 