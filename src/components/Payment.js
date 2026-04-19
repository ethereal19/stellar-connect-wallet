import React, { useState } from 'react';
import { sendXLM, getAccountBalance } from '../services/stellarService';
import './Payment.css';

const Payment = ({ publicKey, balance, onBalanceUpdate }) => {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleSend = async (e) => {
    e.preventDefault();
    
    // Phase 4: Capture & Validate Input
    if (!destination || !amount) {
      setStatus({ state: 'error', message: 'Please fill in all fields' });
      return;
    }

    if (parseFloat(amount) <= 0) {
      setStatus({ state: 'error', message: 'Amount must be greater than 0' });
      return;
    }

    if (!destination.startsWith('G') || destination.length !== 56) {
      setStatus({ state: 'error', message: 'Invalid Stellar destination address' });
      return;
    }

    // Phase 10: Check for low balance before building
    // (Note: publicKey and balance are passed as props)
    const currentBalance = parseFloat(balance);
    const sendAmount = parseFloat(amount);
    const estimatedFee = 0.00001; // Stellar BASE_FEE
    
    if (sendAmount + estimatedFee > currentBalance) {
      setStatus({ state: 'error', message: 'Insufficient balance' });
      return;
    }

    try {
      // Phase 8: Feedback System (Processing)
      setStatus({ state: 'processing', message: 'Preparing transaction...' });
      
      // Phase 5-7: Create, Sign, and Submit
      // Ensure amount is not in scientific notation (e.g., 1e-7)
      const formattedAmount = parseFloat(amount).toFixed(7);
      const result = await sendXLM(destination, formattedAmount, publicKey);
      console.log('Transaction Result:', result);
      
      // Phase 8: Success Outcome
      setStatus({ state: 'success', message: `Transfer complete! XLM sent successfully.` });
      
      // Phase 9: UI Update & Refresh Balance
      const newBalance = await getAccountBalance(publicKey);
      onBalanceUpdate(newBalance);
      
      // Clear fields
      setDestination('');
      setAmount('');
      
      // Optional: Log hash
      console.log('Hash:', result.hash);
    } catch (error) {
      // Phase 10: Error Handling
      console.error("Full Error Object:", error);
      let errorMsg = 'Transaction failed. Please try again.';
      
      // Extract detailed error from Stellar/Horizon response
      const resultCodes = error?.response?.data?.extras?.result_codes;
      const opResultCodes = resultCodes?.operations;
      const opResultCode = opResultCodes && opResultCodes.length > 0 ? opResultCodes[0] : null;
      const txResultCode = resultCodes?.transaction;

      if (error?.message?.includes('User declined')) {
        errorMsg = 'Transaction was rejected in Freighter';
      } else if (opResultCode === 'op_no_destination') {
        errorMsg = 'Destination account does not exist. (First 20 XLM must be sent as Create Account)';
      } else if (opResultCode === 'op_underfunded') {
        errorMsg = 'Insufficient balance for this transaction + fee';
      } else if (txResultCode === 'tx_bad_seq') {
        errorMsg = 'Sequence number mismatch. Please refresh and try again.';
      } else if (opResultCode) {
        errorMsg = `Stellar Error: ${opResultCode}`;
      } else if (txResultCode) {
        errorMsg = `Transaction Error: ${txResultCode}`;
      } else if (error?.message) {
        errorMsg = error.message;
      }

      setStatus({ state: 'error', message: errorMsg });
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Send XLM</h2>
        <form onSubmit={handleSend}>
          <div className="input-group">
            <label htmlFor="destination">Destination Address</label>
            <input
              id="destination"
              type="text"
              placeholder="G..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={status.state === 'processing'}
            />
          </div>
          <div className="input-group">
            <label htmlFor="amount">Amount (XLM)</label>
            <input
              id="amount"
              type="number"
              step="0.0000001"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={status.state === 'processing'}
            />
          </div>
          <button 
            type="submit" 
            className={`send-button ${status.state}`}
            disabled={status.state === 'processing'}
          >
            {status.state === 'processing' ? 'Processing...' : 'Send XLM'}
          </button>
        </form>
        
        {status.message && (
          <div className={`status-message-container ${status.state}`}>
            <div className={`status-message ${status.state}`}>
              {status.message}
            </div>
            {status.state === 'success' && (
              <p className="success-hint">Click the address in the header to verify your new balance.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
