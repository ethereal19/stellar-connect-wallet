import React from 'react';
import "./Header.css";
import { connectWallet, getAccountBalance, disconnectWallet } from '../services/stellarService';

const Header = ({ connected, setConnected, publicKey, setPublicKey, balance, setBalance }) => {
  const [loading, setLoading] = React.useState(false);

  const connectWalletHandler = async () => {
    setLoading(true);
    try {
      const key = await connectWallet();
      if (!key) {
        setLoading(false);
        return;
      }

      const bal = await getAccountBalance(key);
      setPublicKey(key);
      setBalance(bal);
      setConnected(true);
    } catch (e) {
      console.error("Connection failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
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
            <button className="disconnect-btn" onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
        ) : (
          <button className="connect-btn" onClick={connectWalletHandler} disabled={loading}>
            {loading ? (
                <span className="btn-loading">
                    <span className="spinner"></span> Connecting...
                </span>
            ) : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;