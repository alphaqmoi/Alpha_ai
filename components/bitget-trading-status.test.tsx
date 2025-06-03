import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BitgetTradingStatus from './bitget-trading-status';

describe('BitgetTradingStatus', () => {
  it('renders trading status UI', () => {
    render(<BitgetTradingStatus />);
    expect(screen.getByText(/trading/i)).toBeDefined();
  });
});
