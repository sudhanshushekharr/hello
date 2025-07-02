import React from 'react'
import SmartContractDemo from './components/SmartContractDemo'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Web3 Crowdfunding Platform
          </h1>
          <p className="text-gray-600 mt-1">
            Interactive Smart Contract Simulation
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SmartContractDemo />
      </main>
    </div>
  )
}

export default App 