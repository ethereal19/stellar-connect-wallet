import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Payment from './components/Payment';

function App() {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [balance, setBalance] = useState('');

  const handleBalanceUpdate = (newBalance) => {
    setBalance(newBalance);
  };

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
          <Payment 
            publicKey={publicKey} 
            balance={balance}
            onBalanceUpdate={handleBalanceUpdate} 
          />
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
