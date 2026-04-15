import React from 'react';
import "./Header.css";
import { checkConnection, retrievePublicKey, getBalance } from './Freighter';

const Header = ({ connected, setConnected, publicKey, setPublicKey, balance, setBalance }) => {

  const connectWallet = async () => {
    try {
      const allowed = await checkConnection();
      if (!allowed) return alert("Permission denied or Freighter not installed");

      const key = await retrievePublicKey();
      const bal = await getBalance();
      setPublicKey(key);
      setBalance(bal);
      setConnected(true);
    } catch (e) {
      console.error(e);
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setPublicKey('');
    setBalance('');
  };

  return (
    <header className="app-header">
      <div className="logo-section">
        <div className="gradient-logo">StellarPay</div>
      </div>
      
      <div className="wallet-section">
        {connected ? (
          <div className="wallet-info">
            <div className="wallet-details">
              <span className="address">{publicKey.slice(0, 4)}...{publicKey.slice(-4)}</span>
              <span className="balance">{parseFloat(balance).toLocaleString(undefined, {minimumFractionDigits: 2})} XLM</span>
            </div>
            <button className="disconnect-btn" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        ) : (
          <button className="connect-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;