import React, { useState, useEffect } from 'react';
import { Transaction } from '../types/simulation';

interface BlockchainVisualizerProps {
  isActive: boolean;
  currentTransaction?: Transaction | null;
  onComplete?: () => void;
  onClose?: () => void;
}

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  status: 'idle' | 'validating' | 'confirmed';
  delay: number;
}

const BlockchainVisualizer: React.FC<BlockchainVisualizerProps> = ({ 
  isActive, 
  currentTransaction, 
  onComplete,
  onClose
}) => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [broadcastStage, setBroadcastStage] = useState(0);
  const [showSmartContract, setShowSmartContract] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize network nodes
  useEffect(() => {
    const initialNodes: NetworkNode[] = [
      { id: 'node1', x: 20, y: 30, status: 'idle', delay: 0 },
      { id: 'node2', x: 70, y: 20, status: 'idle', delay: 300 },
      { id: 'node3', x: 80, y: 60, status: 'idle', delay: 600 },
      { id: 'node4', x: 30, y: 70, status: 'idle', delay: 900 },
      { id: 'node5', x: 50, y: 45, status: 'idle', delay: 1200 },
      { id: 'smartcontract', x: 50, y: 10, status: 'idle', delay: 1500 },
    ];
    setNodes(initialNodes);
  }, []);

  // Animate transaction broadcasting
  useEffect(() => {
    if (isActive && currentTransaction) {
      setBroadcastStage(0);
      setShowSmartContract(false);
      setIsCompleted(false);
      
      // Stage 1: Start broadcasting
      setTimeout(() => setBroadcastStage(1), 100);
      
      // Stage 2: Nodes start validating
      setTimeout(() => {
        setNodes(prev => prev.map(node => 
          node.id !== 'smartcontract' 
            ? { ...node, status: 'validating' }
            : node
        ));
        setBroadcastStage(2);
      }, 500);
      
      // Stage 3: Nodes confirm validation
      setTimeout(() => {
        setNodes(prev => prev.map(node => 
          node.id !== 'smartcontract'
            ? { ...node, status: 'confirmed' }
            : node
        ));
        setBroadcastStage(3);
      }, 2000);
      
      // Stage 4: Smart contract execution
      setTimeout(() => {
        setShowSmartContract(true);
        setNodes(prev => prev.map(node => 
          node.id === 'smartcontract'
            ? { ...node, status: 'validating' }
            : node
        ));
        setBroadcastStage(4);
      }, 2500);
      
      // Stage 5: Complete (but don't auto-close)
      setTimeout(() => {
        setNodes(prev => prev.map(node => ({ ...node, status: 'confirmed' })));
        setBroadcastStage(5);
        setIsCompleted(true);
        onComplete?.();
      }, 3500);
    }
  }, [isActive, currentTransaction, onComplete]);

  // Reset when dialog is closed
  useEffect(() => {
    if (!isActive) {
      setNodes(prev => prev.map(node => ({ ...node, status: 'idle' })));
      setBroadcastStage(0);
      setShowSmartContract(false);
      setIsCompleted(false);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] flex flex-col relative overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors z-10"
            title="Close visualization"
          >
            ✕
          </button>

          <div className="text-center pr-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
              🌐 Blockchain Network Simulation
              {isCompleted && (
                <span className="ml-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  ✓ Complete
                </span>
              )}
            </h2>
            <p className="text-gray-600 text-sm">
              {isCompleted 
                ? "Transaction successfully processed! Close when ready or watch it replay."
                : "Watch your transaction get validated across the decentralized network"
              }
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Network Visualization */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 overflow-hidden">
              {/* Background Grid */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full">
                {nodes.slice(0, -1).map((node, index) => (
                  nodes.slice(index + 1).map((targetNode, targetIndex) => (
                    <line
                      key={`${node.id}-${targetNode.id}`}
                      x1={`${node.x}%`}
                      y1={`${node.y}%`}
                      x2={`${targetNode.x}%`}
                      y2={`${targetNode.y}%`}
                      stroke={broadcastStage >= 2 ? "#10b981" : "#d1d5db"}
                      strokeWidth="2"
                      className={`transition-all duration-500 ${
                        broadcastStage >= 2 ? 'animate-pulse' : ''
                      }`}
                    />
                  ))
                )).flat()}
              </svg>

              {/* Network Nodes */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                    node.status === 'validating' ? 'animate-pulse scale-125' : ''
                  } ${
                    node.status === 'confirmed' ? 'scale-110' : ''
                  }`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  {node.id === 'smartcontract' ? (
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold transition-all duration-500 ${
                      node.status === 'idle' ? 'bg-purple-100 text-purple-600' :
                      node.status === 'validating' ? 'bg-purple-500 text-white animate-bounce' :
                      'bg-green-500 text-white'
                    }`}>
                      📋
                    </div>
                  ) : (
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-lg font-bold transition-all duration-500 ${
                      node.status === 'idle' ? 'bg-gray-200 text-gray-600' :
                      node.status === 'validating' ? 'bg-yellow-400 text-yellow-900 animate-spin' :
                      'bg-green-500 text-white'
                    }`}>
                      🖥️
                    </div>
                  )}
                  
                  {/* Node Label */}
                  <div className="absolute top-12 md:top-16 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center">
                    <div className="whitespace-nowrap">{node.id === 'smartcontract' ? 'Smart Contract' : `Node ${node.id.slice(-1)}`}</div>
                    <div className={`text-xs mt-1 ${
                      node.status === 'idle' ? 'text-gray-500' :
                      node.status === 'validating' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {node.status === 'idle' ? 'Waiting' :
                       node.status === 'validating' ? 'Validating...' :
                       'Confirmed ✓'}
                    </div>
                  </div>
                </div>
              ))}

              {/* Transaction Broadcast Animation */}
              {broadcastStage >= 1 && (
                <div className="absolute inset-0">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full animate-ping"
                      style={{
                        left: '20%',
                        top: '30%',
                        animationDelay: `${i * 200}ms`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Smart Contract Execution Visualization */}
              {showSmartContract && (
                <div className="absolute top-2 left-2 right-2 md:top-4 md:left-4 md:right-4 bg-purple-100 border border-purple-300 rounded-lg p-3 md:p-4 animate-slide-up">
                  <h4 className="font-semibold text-purple-900 mb-2 text-sm md:text-base">🔧 Smart Contract Executing</h4>
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center text-xs md:text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span>Validating transaction parameters...</span>
                    </div>
                    <div className="flex items-center text-xs md:text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span>Updating campaign balance...</span>
                    </div>
                    <div className="flex items-center text-xs md:text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span>Recording transaction on blockchain...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Completion Message Overlay */}
              {isCompleted && (
                <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 bg-green-100 border border-green-300 rounded-lg p-3 md:p-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1 text-sm md:text-base">🎉 Transaction Complete!</h4>
                      <p className="text-green-700 text-xs md:text-sm">
                        Successfully processed and confirmed by the network
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // Reset animation to replay
                        setBroadcastStage(0);
                        setShowSmartContract(false);
                        setIsCompleted(false);
                        setNodes(prev => prev.map(node => ({ ...node, status: 'idle' })));
                        
                        // Restart animation
                        setTimeout(() => setBroadcastStage(1), 100);
                      }}
                      className="px-2 py-1 md:px-3 md:py-1 bg-green-600 text-white rounded text-xs md:text-sm hover:bg-green-700 transition-colors whitespace-nowrap ml-2"
                    >
                      🔄 Replay
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Transaction Info */}
            {currentTransaction && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Transaction Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium capitalize">{currentTransaction.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-2 font-medium">{currentTransaction.amount} ETH</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Gas:</span>
                    <span className="ml-2 font-medium">{currentTransaction.gasUsed.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stage Progress */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Broadcasting</span>
                <span className="hidden sm:inline">Validating</span>
                <span className="hidden sm:inline">Confirming</span>
                <span className="hidden sm:inline">Executing</span>
                <span>Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(broadcastStage / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Educational tip */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                💡 <strong>Educational Tip:</strong> This visualization shows how transactions propagate through a decentralized network. Each node validates the transaction independently, ensuring security and consensus.
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 md:p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
              🔗 <strong>Blockchain Education:</strong> Understanding decentralized validation
            </div>
            <div className="flex gap-3">
              {isCompleted && (
                <button
                  onClick={() => {
                    setBroadcastStage(0);
                    setShowSmartContract(false);
                    setIsCompleted(false);
                    setNodes(prev => prev.map(node => ({ ...node, status: 'idle' })));
                    setTimeout(() => setBroadcastStage(1), 100);
                  }}
                  className="px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  🔄 Replay Animation
                </button>
              )}
              <button
                onClick={onClose}
                className="px-3 py-2 md:px-4 md:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainVisualizer; 