import React, { useState, useEffect } from 'react';

interface CelebrationAnimationProps {
  isActive: boolean;
  campaignTitle: string;
  amount: number;
  onComplete?: () => void;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
}

interface Firework {
  id: number;
  x: number;
  y: number;
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
  }>;
}

const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  isActive,
  campaignTitle,
  amount,
  onComplete
}) => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const [messageStage, setMessageStage] = useState(0);

  // Initialize celebration
  useEffect(() => {
    if (isActive) {
      // Generate confetti
      const newConfetti: Confetti[] = [];
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
      
      for (let i = 0; i < 50; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          y: -10,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 4,
          rotation: Math.random() * 360,
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: Math.random() * 3 + 2
          }
        });
      }
      
      setConfetti(newConfetti);
      setShowMessage(true);
      setMessageStage(1);
      
      // Create fireworks
      setTimeout(() => {
        createFirework(25, 30);
      }, 500);
      
      setTimeout(() => {
        createFirework(75, 25);
      }, 1000);
      
      setTimeout(() => {
        createFirework(50, 20);
      }, 1500);
      
      // Message stages
      setTimeout(() => setMessageStage(2), 1000);
      setTimeout(() => setMessageStage(3), 2000);
      
      // Complete celebration
      setTimeout(() => {
        setShowMessage(false);
        onComplete?.();
      }, 4000);
      
      // Reset
      setTimeout(() => {
        setConfetti([]);
        setFireworks([]);
        setMessageStage(0);
      }, 5000);
    }
  }, [isActive, onComplete]);

  // Animate confetti falling
  useEffect(() => {
    if (confetti.length > 0) {
      const interval = setInterval(() => {
        setConfetti(prev => prev.map(piece => ({
          ...piece,
          x: piece.x + piece.velocity.x,
          y: piece.y + piece.velocity.y,
          rotation: piece.rotation + 5
        })).filter(piece => piece.y < 110));
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [confetti.length]);

  const createFirework = (x: number, y: number) => {
    const particles = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
    
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const velocity = Math.random() * 3 + 2;
      particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1
      });
    }
    
    const newFirework: Firework = {
      id: Date.now() + Math.random(),
      x,
      y,
      particles
    };
    
    setFireworks(prev => [...prev, newFirework]);
    
    // Animate firework particles
    let animationFrame = 0;
    const animateFirework = () => {
      setFireworks(prev => prev.map(fw => 
        fw.id === newFirework.id
          ? {
              ...fw,
              particles: fw.particles.map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                vy: p.vy + 0.1, // gravity
                life: p.life - 0.02
              })).filter(p => p.life > 0)
            }
          : fw
      ));
      
      animationFrame++;
      if (animationFrame < 100) {
        requestAnimationFrame(animateFirework);
      } else {
        setFireworks(prev => prev.filter(fw => fw.id !== newFirework.id));
      }
    };
    
    requestAnimationFrame(animateFirework);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Confetti */}
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: '2px'
          }}
        />
      ))}
      
      {/* Fireworks */}
      {fireworks.map(firework => (
        <div key={firework.id} className="absolute" style={{ left: `${firework.x}%`, top: `${firework.y}%` }}>
          {firework.particles.map((particle, index) => (
            <div
              key={index}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                backgroundColor: particle.color,
                opacity: particle.life,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      ))}
      
      {/* Success Message */}
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center transform transition-all duration-500 ${
            messageStage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}>
            <div className={`text-6xl mb-4 transition-all duration-500 ${
              messageStage >= 2 ? 'animate-bounce' : ''
            }`}>
              🎉
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Campaign Funded!
            </h2>
            
            <p className="text-gray-600 mb-4">
              <strong>"{campaignTitle}"</strong> has reached its goal!
            </p>
            
            <div className={`text-3xl font-bold text-green-600 mb-4 transition-all duration-500 ${
              messageStage >= 3 ? 'animate-pulse' : ''
            }`}>
              {amount} ETH Raised! 💰
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Smart contract automatically executing...
              </div>
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Funds being transferred to creator...
              </div>
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Transaction recorded on blockchain!
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium text-sm">
                🌟 This is the power of decentralized crowdfunding!
              </p>
              <p className="text-green-700 text-xs mt-1">
                No intermediaries • Automatic execution • Complete transparency
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
    </div>
  );
};

export default CelebrationAnimation; 