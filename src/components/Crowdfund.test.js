import { render, screen } from '@testing-library/react';
import Crowdfund from './Crowdfund';

// Mocking Stellar Service
jest.mock('../services/stellarService', () => ({
  fetchCampaignData: jest.fn(() => Promise.resolve({ total: 0, target: 0 })),
  initializeCampaign: jest.fn(),
  donateToCampaign: jest.fn(),
  getAccountBalance: jest.fn(() => Promise.resolve("100")),
  withdrawFunds: jest.fn()
}));

describe('Crowdfund Component', () => {
  test('shows connect wallet prompt when wallet not connected', () => {
    render(<Crowdfund publicKey={null} balance="0" onBalanceUpdate={() => {}} />);
    const prompt = screen.getByText(/Please connect your wallet to start/i);
    expect(prompt).toBeInTheDocument();
  });

  test('shows set campaign goal input when wallet connected', () => {
    // Stats target is 0 by default, so it should show the Goal input
    render(<Crowdfund publicKey="GB..." balance="100" onBalanceUpdate={() => {}} />);
    const goalLabel = screen.getByText(/Set Campaign Goal \(XLM\)/i);
    expect(goalLabel).toBeInTheDocument();
  });

  test('shows start campaign button when wallet connected', () => {
    render(<Crowdfund publicKey="GB..." balance="100" onBalanceUpdate={() => {}} />);
    const startButton = screen.getByText(/Start Campaign/i);
    expect(startButton).toBeInTheDocument();
  });
});
