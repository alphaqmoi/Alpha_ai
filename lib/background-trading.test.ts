import { describe, it, expect, vi } from 'vitest';
import * as trading from './background-trading';

describe('background-trading', () => {
  it('should export getTradingData and saveTradingData', () => {
    expect(typeof trading.getTradingData).toBe('function');
    expect(typeof trading.saveTradingData).toBe('function');
  });

  it('should notify user on trade event', async () => {
    // Mock global emitter
    const notify = vi.spyOn(console, 'log');
    await trading.saveTradingData({ trades: [] });
    expect(notify).toHaveBeenCalled();
    notify.mockRestore();
  });
});
