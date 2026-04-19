import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import Crowdfund from './components/Crowdfund';

// Mocking window.matchMedia for ThemeToggle
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mocking Stellar Service
jest.mock('./services/stellarService', () => ({
  fetchCampaignData: jest.fn(() => Promise.resolve({ total: 0, target: 0 })),
  initializeCampaign: jest.fn(),
  donateToCampaign: jest.fn(),
  getAccountBalance: jest.fn(() => Promise.resolve("100")),
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn()
}));

// Test 1 — App Renders
test('renders app and main title', () => {
  render(<App />);
  const titleElement = screen.getByText(/StellarPay/i);
  expect(titleElement).toBeInTheDocument();
});

// Test 2 — Connect Wallet Button
test('renders connect wallet button', () => {
  render(<App />);
  const connectButton = screen.getByText(/Connect Wallet/i);
  expect(connectButton).toBeInTheDocument();
});

// Test 3 — Input Validation
test('handles invalid campaign goal input', () => {
  render(<Crowdfund publicKey="GB..." balance="100" onBalanceUpdate={() => {}} />);
  const startButton = screen.getByText(/Start Campaign/i);
  fireEvent.click(startButton);
  const errorMessage = screen.getByText(/Enter a target goal greater than 0/i);
  expect(errorMessage).toBeInTheDocument();
});
