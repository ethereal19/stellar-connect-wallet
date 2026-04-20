import { render, screen, fireEvent } from '@testing-library/react';
import Payment from './Payment';

// Mocking Stellar Service
jest.mock('../services/stellarService', () => ({
  sendXLM: jest.fn(),
  getAccountBalance: jest.fn(() => Promise.resolve("100"))
}));

describe('Payment Component', () => {
  test('renders send XLM button', () => {
    // Note: There are two "Send XLM" texts (Title and Button)
    // We use getAllByText or specific query to match the button
    render(<Payment publicKey="GB..." balance="100" onBalanceUpdate={() => {}} />);
    const buttons = screen.getAllByText(/Send XLM/i);
    // The button is the one with type="submit" or we can check the length
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.some(b => b.tagName === 'BUTTON')).toBe(true);
  });

  test('shows error when fields are empty', () => {
    render(<Payment publicKey="GB..." balance="100" onBalanceUpdate={() => {}} />);
    const sendButton = screen.getByRole('button', { name: /Send XLM/i });
    fireEvent.click(sendButton);
    const errorMessage = screen.getByText(/Please fill in all fields/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
