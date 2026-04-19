import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Crowdfund.css';
import { 
  fetchCampaignData,
  initializeCampaign,
  donateToCampaign,
  getAccountBalance 
} from '../services/stellarService';

const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx/";

const Crowdfund = ({ publicKey, balance, onBalanceUpdate }) => {
  const [stats, setStats] = useState({ total: 0, target: 0 });
  const [goalInput, setGoalInput] = useState('');
  const [donationInput, setDonationInput] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [lastTxHash, setLastTxHash] = useState(null);
  
  const isFetching = useRef(false);
  const balanceRef = useRef(balance);
  const timeoutRef = useRef(null);

  useEffect(() => { balanceRef.current = balance; }, [balance]);

  const refreshData = useCallback(async () => {
    // Flowchart: Is wallet connected? NO -> STOP
    if (!publicKey) return; 
    
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      console.log("Refreshing data for address:", publicKey);
      const data = await fetchCampaignData(publicKey);
      if (data && data.target > 0) {
        setStats(prev => ({
            ...prev,
            total: data.total || prev.total,
            target: data.target || prev.target
        }));
      }
      
      const currentBalance = await getAccountBalance(publicKey);
      if (currentBalance !== balanceRef.current) {
        onBalanceUpdate(currentBalance);
      }
    } catch (e) {
      console.warn("Refresh failed", e);
    } finally {
      isFetching.current = false;
    }
  }, [publicKey, onBalanceUpdate]);

  // Use a ref to always point to the latest refreshData for the interval
  const refreshDataRef = useRef(refreshData);
  useEffect(() => { refreshDataRef.current = refreshData; }, [refreshData]);

  // Flowchart: Add useEffect with [] to run only once (mount)
  useEffect(() => {
    const poll = () => refreshDataRef.current();
    poll();
    const interval = setInterval(poll, 30000); // 30s delay
    return () => clearInterval(interval);
  }, []); 

  // Separate effect for immediate refresh when publicKey changes
  useEffect(() => {
    if (publicKey) refreshData();
  }, [publicKey, refreshData]);

  const startTimeoutFallback = (message) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setStatus({ type: 'error', msg: `Timeout: ${message}` });
    }, 45000);
  };

  // === Step 3: Extract transaction hash from result ===
  const extractTxHash = (result) => {
    if (!result) return null;
    return result.hash || result.id || result._links?.transaction?.href?.split('/').pop() || null;
  };

  const handleInitialize = async (e) => {
    e.preventDefault();
    // Step 5: Error — Wallet not connected
    if (!publicKey) {
      setStatus({ type: 'error', msg: '⚠️ Connect your wallet first.' });
      return;
    }

    const goal = parseFloat(goalInput);
    if (!goalInput || isNaN(goal) || goal <= 0) {
      setStatus({ type: 'error', msg: '⚠️ Enter a target goal greater than 0.' });
      return;
    }

    setLoading(true);
    setLastTxHash(null);

    // Step 2: Granular status feedback
    setStatus({ type: 'pending', msg: '⏳ Preparing transaction...' });
    startTimeoutFallback('Initialization taking too long.');

    try {
      setStatus({ type: 'pending', msg: '🔐 Waiting for wallet signature...' });
      const result = await initializeCampaign(goalInput, publicKey);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      // Step 3: Capture transaction hash
      const txHash = extractTxHash(result);
      if (txHash) {
        setLastTxHash(txHash);
        console.log("✅ Campaign TX Hash:", txHash);
      }

      // Update UI immediately
      setStats({ total: 0, target: goal }); 
      
      setStatus({ type: 'success', msg: `✅ Campaign started successfully!${txHash ? '' : ''}` });
      setGoalInput('');
      await refreshData();
    } catch (error) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Step 5: Handle specific errors
      const msg = error.message || 'Transaction failed';
      if (msg.includes('denied') || msg.includes('rejected') || msg.includes('cancel')) {
        setStatus({ type: 'error', msg: '❌ Transaction rejected by wallet.' });
      } else {
        setStatus({ type: 'error', msg: `❌ ${msg}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    
    // Step 5: Error — Wallet not connected
    if (!publicKey) {
      setStatus({ type: 'error', msg: '⚠️ Connect your wallet first.' });
      return;
    }

    const amount = parseFloat(donationInput);
    const userBalance = parseFloat(balance);
    const remaining = stats.target - stats.total;

    // Step 5: Error — Empty / invalid input
    if (!donationInput || isNaN(amount) || amount <= 0) {
      setStatus({ type: 'error', msg: '⚠️ Enter a valid donation amount.' });
      return;
    }

    // Step 5: Error — Insufficient balance
    if (amount > userBalance) {
      setStatus({ type: 'error', msg: `❌ Insufficient funds. You have ${userBalance.toFixed(2)} XLM.` });
      return;
    }

    // Error — Donation exceeds remaining goal
    if (amount > remaining) {
      setStatus({ type: 'error', msg: `❌ Exceeds goal. Max donation: ${remaining.toFixed(2)} XLM.` });
      return;
    }

    setLoading(true);
    setLastTxHash(null);

    // Step 2: Granular status feedback
    setStatus({ type: 'pending', msg: '⏳ Preparing transaction...' });
    startTimeoutFallback('Donation taking too long.');

    try {
      setStatus({ type: 'pending', msg: '🔐 Waiting for wallet signature...' });
      const result = await donateToCampaign(donationInput, publicKey);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setStatus({ type: 'pending', msg: '📡 Confirming on blockchain...' });

      // Step 3: Capture transaction hash
      const txHash = extractTxHash(result);
      if (txHash) {
        setLastTxHash(txHash);
        console.log("✅ Donation TX Hash:", txHash);
      }

      // Optimistic UI update
      setStats(prev => ({ ...prev, total: prev.total + amount }));
      
      // History update with tx hash
      const newDonation = {
        amount,
        sender: publicKey.substring(0, 4) + '...' + publicKey.substring(publicKey.length - 4),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        txHash
      };
      setDonations(prev => [newDonation, ...prev].slice(0, 5));

      setStatus({ type: 'success', msg: `✅ Donation of ${amount} XLM successful!` });
      setDonationInput('');
      await refreshData();
      
    } catch (error) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Step 5: Handle specific errors
      const msg = error.message || 'Transaction failed';
      if (msg.includes('denied') || msg.includes('rejected') || msg.includes('cancel')) {
        setStatus({ type: 'error', msg: '❌ Transaction rejected by wallet.' });
      } else if (msg.includes('Insufficient') || msg.includes('insufficient')) {
        setStatus({ type: 'error', msg: '❌ Insufficient balance for this transaction.' });
      } else {
        setStatus({ type: 'error', msg: `❌ ${msg}` });
      }
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: '', msg: '' }), 8000);
    }
  };

  // Step 2 Logic: progress = (totalRaised / goal) × 100
  const progress = stats.target > 0 ? (stats.total / stats.target) * 100 : 0;
  const isGoalReached = stats.target > 0 && stats.total >= stats.target;
  const remaining = Math.max(0, stats.target - stats.total);

  return (
    <div className="crowdfund-container">
      <div className="crowdfund-header">
        <h2 className="crowdfund-title">Community Fund</h2>
        <p className="hero-subtitle">Support our latest decentralized project.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Raised</div>
          <div className={`stat-value ${isGoalReached ? 'goal-reached-text' : ''}`}>
            {stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XLM
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Goal</div>
          <div className="stat-value">{stats.target.toLocaleString()} XLM</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className={`progress-fill ${isGoalReached ? 'progress-finished' : ''}`} 
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <div className="progress-text">
            {isGoalReached 
                ? `100.0% — Goal Reached! 🎉` 
                : `${progress.toFixed(1)}% of goal reached`}
        </div>
      </div>

      <div className="action-section">
        {!publicKey ? (
            <div className="connect-prompt">🔗 Please connect your wallet to start.</div>
        ) : stats.target === 0 ? (
          <form onSubmit={handleInitialize} className="input-group">
            <label>Set Campaign Goal (XLM)</label>
            <input 
              id="goal-input"
              type="number" 
              className="input-field"
              placeholder="e.g. 1000"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              disabled={loading}
            />
            <button id="start-campaign-btn" type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span> Processing...
                </span>
              ) : 'Start Campaign'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleDonate} className="input-group">
            <label>Enter Donation Amount (XLM)</label>
            <input 
              id="donation-input"
              type="number" 
              className="input-field"
              placeholder={`Max: ${remaining.toFixed(2)} XLM`}
              value={donationInput}
              onChange={(e) => setDonationInput(e.target.value)}
              disabled={loading || isGoalReached}
            />
            <button 
                id="donate-btn"
                type="submit" 
                className={`submit-btn ${isGoalReached || loading ? 'btn-disabled' : ''}`} 
                disabled={loading || isGoalReached}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span> Processing...
                </span>
              ) : isGoalReached ? '🎉 Goal Met' : 'Donate Now'}
            </button>
          </form>
        )}
      </div>

      {/* Status Messages */}
      {status.msg && (
        <div className={`status-msg status-${status.type}`}>
          {status.msg}
        </div>
      )}

      {/* Step 3 & 4: Transaction Hash + Explorer Link */}
      {lastTxHash && (
        <div className="tx-hash-container">
          <div className="tx-hash-label">Transaction Hash</div>
          <div className="tx-hash-value">{lastTxHash.substring(0, 12)}...{lastTxHash.substring(lastTxHash.length - 12)}</div>
          <a 
            href={`${EXPLORER_BASE}${lastTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-explorer-link"
          >
            🔍 View on Stellar Explorer
          </a>
        </div>
      )}

      {/* Donation History */}
      {donations.length > 0 && (
        <div className="donation-history">
          <h3 className="history-title">Recent Donors</h3>
          <div className="history-list">
            {donations.map((d, i) => (
              <div key={i} className="history-item">
                <span className="history-sender">{d.sender}</span>
                <span className="history-amount">+{d.amount} XLM</span>
                <span className="history-time">{d.time}</span>
                {d.txHash && (
                  <a 
                    href={`${EXPLORER_BASE}${d.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="history-tx-link"
                    title="View on Explorer"
                  >
                    🔗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Crowdfund;
