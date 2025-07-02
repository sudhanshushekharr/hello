export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  deadline: Date;
  creator: string;
  isActive: boolean;
  backers: number;
}

export interface Transaction {
  id: string;
  type: 'donation' | 'withdrawal' | 'refund';
  amount: number;
  from: string;
  to: string;
  campaignId: string;
  timestamp: Date;
  gasUsed: number;
  gasPrice: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface SmartContractState {
  totalCampaigns: number;
  totalFundsRaised: number;
  totalTransactions: number;
  contractBalance: number;
}

export interface SimulationStep {
  id: string;
  title: string;
  description: string;
  action: string;
  isComplete: boolean;
  result?: string;
} 