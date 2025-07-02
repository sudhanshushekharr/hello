import React, { useState, useEffect } from 'react';

interface FundFlowAnimationProps {
  isActive: boolean;
  amount: number;
  fromType: 'donor' | 'campaign';
  toType: 'campaign' | 'creator';
  onComplete?: () => void;
}

interface CoinParticle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  delay: number;
}

const FundFlowAnimation: React.FC<FundFlowAnimationProps> = ({
  isActive,
  amount,
  fromType,
  toType,
  onComplete
}) => {
  const [coins, setCoins] = useState<CoinParticle[]>([]);
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    if (isActive) {
      // Generate coin particles based on amount
      const coinCount = Math.min(Math.ceil(amount), 10);
      const newCoins: CoinParticle[] = [];
      
      for (let i = 0; i < coinCount; i++) {
        newCoins.push({
          id: i,
          x: fromType === 'donor' ? 10 : 50,
          y: 50 + (Math.random() - 0.5) * 20,
          targetX: toType === 'campaign' ? 50 : 90,
          targetY: 50 + (Math.random() - 0.5) * 20,
          delay: i * 100
        });
      }
      
      setCoins(newCoins);
      setAnimationStage(1);
      
      // Start animation after coins are set
      setTimeout(() => setAnimationStage(2), 100);
      
      // Complete animation
      setTimeout(() => {
        setAnimationStage(3);
        onComplete?.();
      }, 2000);
      
      // Reset
      setTimeout(() => {
        setCoins([]);
        setAnimationStage(0);
      }, 3000);
    }
  }, [isActive, amount, fromType, toType, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <div className="relative w-full h-full">
        {/* Source Icon */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 text-4xl animate-bounce"
          style={{ 
            left: fromType === 'donor' ? '10%' : '50%', 
            top: '50%' 
          }}
        >
          {fromType === 'donor' ? '👤' : '📊'}
        </div>
        
        {/* Target Icon */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 text-4xl animate-bounce"
          style={{ 
            left: toType === 'campaign' ? '50%' : '90%', 
            top: '50%' 
          }}
        >
          {toType === 'campaign' ? '🎯' : '👨‍💼'}
        </div>
        
        {/* Flowing Coins */}
        {coins.map((coin) => (
          <div
            key={coin.id}
            className={`absolute w-8 h-8 text-2xl transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 ease-in-out ${
              animationStage >= 2 ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
            }`}
            style={{
              left: animationStage >= 2 ? `${coin.targetX}%` : `${coin.x}%`,
              top: animationStage >= 2 ? `${coin.targetY}%` : `${coin.y}%`,
              transitionDelay: `${coin.delay}ms`,
              zIndex: 45
            }}
          >
            <div className="animate-spin">💰</div>
          </div>
        ))}
        
        {/* Flow Trail */}
        {animationStage >= 2 && (
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0"/>
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <line
              x1={fromType === 'donor' ? '10%' : '50%'}
              y1="50%"
              x2={toType === 'campaign' ? '50%' : '90%'}
              y2="50%"
              stroke="url(#flowGradient)"
              strokeWidth="4"
              className="animate-pulse"
            />
          </svg>
        )}
        
        {/* Amount Display */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm animate-bounce"
          style={{ 
            left: '50%', 
            top: '40%' 
          }}
        >
          +{amount} ETH
        </div>
      </div>
    </div>
  );
};

export default FundFlowAnimation; 