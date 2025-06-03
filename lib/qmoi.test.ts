import { describe, it, expect } from 'vitest';
import { getQmoiTradeDecision } from './qmoi';

describe('qmoi', () => {
  it('should return a trade decision object', async () => {
    const result = await getQmoiTradeDecision(1.0, []);
    expect(result).toHaveProperty('symbol');
    expect(result).toHaveProperty('side');
    expect(result).toHaveProperty('amount');
  });
});
