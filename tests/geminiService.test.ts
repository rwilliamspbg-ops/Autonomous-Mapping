import { describe, it, expect, vi } from 'vitest';
import { getSovereignInsights } from '../services/geminiService';

describe('Gemini Service', () => {
  it('should return mock data when API key is missing', async () => {
    const insights = await getSovereignInsights('test location');
    expect(insights).toHaveProperty('summary');
    expect(insights.riskScore).toBe(42);
  });
});
