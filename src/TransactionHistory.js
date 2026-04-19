import React, { useState, useEffect } from 'react';
import { fetchTransactions } from './services/stellarService';
import './TransactionHistory.css';

const TransactionHistory = ({ address }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      loadTransactions();
    }
  }, [address]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions(address);
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions", error);
    } finally {
      setLoading(false);
    }
  };

  if (!address) return null;

  return (
    <div className="transaction-history-container">
      <h3>Recent Transactions</h3>
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Hash</th>
                <th>Date</th>
                <th>Fee</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.hash}>
                    <td className="tx-hash" title={tx.hash}>
                      {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
                    </td>
                    <td>{new Date(tx.created_at).toLocaleString()}</td>
                    <td>{tx.fee} stroops</td>
                    <td>
                      <span className={`status-badge ${tx.successful ? 'success' : 'failed'}`}>
                        {tx.successful ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <button className="refresh-btn" onClick={loadTransactions}>Refresh</button>
    </div>
  );
};

export default TransactionHistory;
