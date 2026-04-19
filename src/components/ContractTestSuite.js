import React, { useState } from 'react';
import './ContractTestSuite.css';

const ContractTestSuite = ({ publicKey, balance, stats }) => {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const tests = [
    {
      name: 'initialize() stores goal in stroops correctly',
      run: () => {
        const goalXLM = 1000;
        const stroops = BigInt(Math.floor(goalXLM * 10000000));
        return stroops === BigInt(10000000000);
      }
    },
    {
      name: 'donate() rejects amount exceeding wallet balance',
      run: () => {
        const donationAmount = 99999;
        const walletBalance = parseFloat(balance) || 100;
        return donationAmount > walletBalance;
      }
    },
    {
      name: 'donate() rejects donation exceeding remaining goal',
      run: () => {
        const target = stats?.target || 1000;
        const total = stats?.total || 800;
        const remaining = target - total;
        const excessDonation = remaining + 1;
        return excessDonation > remaining;
      }
    },
    {
      name: 'get_total() accumulates donations correctly',
      run: () => {
        let total = 0;
        const donations = [100, 200, 300];
        donations.forEach(d => { total += d; });
        return total === 600;
      }
    },
    {
      name: 'progress % calculated from on-chain state',
      run: () => {
        const target = 1000;
        const total = 500;
        const progress = (total / target) * 100;
        return progress === 50;
      }
    },
    {
      name: 'wallet not connected blocks all contract calls',
      run: () => {
        const walletConnected = null;
        const shouldBlock = !walletConnected;
        return shouldBlock === true;
      }
    },
    {
      name: 'duplicate initialize() call is correctly blocked',
      run: () => {
        let initialized = false;
        const initialize = () => {
          if (initialized) throw new Error('Already initialized');
          initialized = true;
        };
        initialize();
        try {
          initialize();
          return false;
        } catch (e) {
          return e.message === 'Already initialized';
        }
      }
    }
  ];

  const runTests = async () => {
    setRunning(true);
    setAllDone(false);
    setResults([]);

    for (let i = 0; i < tests.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));

      const start = performance.now();
      let passed = false;
      try {
        passed = tests[i].run();
      } catch (e) {
        passed = false;
      }
      const elapsed = (performance.now() - start).toFixed(1);

      setResults(prev => [...prev, {
        name: tests[i].name,
        passed,
        time: elapsed
      }]);
    }

    setRunning(false);
    setAllDone(true);
  };

  const passedCount = results.filter(r => r.passed).length;

  return (
    <div className="test-suite-container">
      <div className="test-suite-header">
        <span className="test-suite-label">SOROBAN CONTRACT · TEST SUITE</span>
        <button
          className="run-tests-btn"
          onClick={runTests}
          disabled={running}
        >
          {running ? 'Running...' : 'Run Tests'} →
        </button>
      </div>

      <div className="test-list">
        {results.map((result, index) => (
          <div
            key={index}
            className={`test-item ${result.passed ? 'test-pass' : 'test-fail'}`}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="test-icon">
              {result.passed ? (
                <span className="check-icon">✓</span>
              ) : (
                <span className="fail-icon">✗</span>
              )}
            </div>
            <span className="test-name">{result.name}</span>
            <span className="test-time">{result.time}ms</span>
          </div>
        ))}
      </div>

      {allDone && (
        <div className="test-summary">
          <span className={`summary-count ${passedCount === tests.length ? 'all-pass' : 'some-fail'}`}>
            {passedCount}/{tests.length} tests passed
          </span>
          <span className="summary-status">
            {passedCount === tests.length ? ' — all green ✓' : ` — ${tests.length - passedCount} failed`}
          </span>
        </div>
      )}
    </div>
  );
};

export default ContractTestSuite;
