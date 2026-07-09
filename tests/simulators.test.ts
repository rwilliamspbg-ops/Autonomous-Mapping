import { describe, it, expect, vi } from 'vitest';
import { startOrbSlamSimulation } from '../simulators/orbSlamSimulator';
import { generateZKProof } from '../simulators/zkProofSimulator';

describe('OrbSLAM3 Simulator', () => {
  it('should call onUpdate with tracking data', async () => {
    vi.useFakeTimers();
    const onUpdate = vi.fn();
    const stop = startOrbSlamSimulation(onUpdate);

    vi.advanceTimersByTime(200);
    expect(onUpdate).toHaveBeenCalled();
    const firstCall = onUpdate.mock.calls[0][0];
    expect(firstCall).toHaveProperty('tracking');

    stop();
    vi.useRealTimers();
  });
});

describe('ZK Proof Simulator', () => {
  it('should generate a proof object', async () => {
    const proof = await generateZKProof('test-payload');
    expect(proof).toHaveProperty('proof');
    expect(proof.publicSignals).toContain('test-payload');
  });
});
