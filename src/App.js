import React, { useState, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import Payment from './components/Payment';
import Crowdfund from './components/Crowdfund';

function App() {
  console.log("App Component Rendering...");
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [balance, setBalance] = useState('');
  const [activeTab, setActiveTab] = useState('payment'); // 'payment' or 'crowdfund'

  const handleBalanceUpdate = useCallback((newBalance) => {
    setBalance(newBalance);
  }, []);

  return (
    <div className="App">
      <Header 
        connected={connected} 
        setConnected={setConnected}
        publicKey={publicKey}
        setPublicKey={setPublicKey}
        balance={balance}
        setBalance={setBalance}
      />
      <main>
        {connected ? (
          <>
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => setActiveTab('payment')}
              >
                Direct Payment
              </button>
              <button 
                className={`tab-btn ${activeTab === 'crowdfund' ? 'active' : ''}`}
                onClick={() => setActiveTab('crowdfund')}
              >
                Crowdfunding
              </button>
            </div>

            {activeTab === 'payment' ? (
              <Payment 
                publicKey={publicKey} 
                balance={balance}
                onBalanceUpdate={handleBalanceUpdate} 
              />
            ) : (
              <Crowdfund 
                publicKey={publicKey}
                balance={balance}
                onBalanceUpdate={handleBalanceUpdate}
              />
            )}
          </>
        ) : (
          <div className="hero-section">
            <h1 className="hero-title">Secure. Fast. Simple.</h1>
            <p className="hero-subtitle">Connect your Freighter wallet to start sending XLM on the Stellar network.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

