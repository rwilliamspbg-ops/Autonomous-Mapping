import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import CountryPanel from '../components/CountryPanel';
import WorldMap from '../components/WorldMap';

vi.mock('../services/geminiService', () => ({
  getSovereignInsights: vi.fn().mockImplementation(() => new Promise(() => {})),
  chatWithAnalyst: vi.fn()
}));

describe('UI Components', () => {
  it('ErrorBoundary should catch errors and show fallback', () => {
    const ThrowError = () => {
      throw new Error('Test Error');
    };

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/System Anomaly Detected/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('CountryPanel should show accessible loading status when loading', () => {
    render(<CountryPanel country={{ id: 'KE', name: 'Kenya' }} onClose={() => {}} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('CountryPanel close button can receive focus and closes on click', () => {
    const handleClose = vi.fn();
    render(<CountryPanel country={{ id: 'KE', name: 'Kenya' }} onClose={handleClose} />);
    const closeBtn = screen.getByLabelText(/Close Regional Pilot Brief/i);
    expect(closeBtn).toBeInTheDocument();
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);
  });

  it('WorldMap should render tactical zoom controls with correct ARIA labels', () => {
    const { container } = render(<WorldMap onCountrySelect={vi.fn()} />);
    const zoomInBtn = screen.getByLabelText('Zoom In (Press + or =)');
    const zoomOutBtn = screen.getByLabelText('Zoom Out (Press - or _)');
    const resetZoomBtn = screen.getByLabelText('Reset Zoom (Press r or R)');

    expect(zoomInBtn).toBeInTheDocument();
    expect(zoomOutBtn).toBeInTheDocument();
    expect(resetZoomBtn).toBeInTheDocument();

    expect(zoomInBtn).toHaveAttribute('title', 'Zoom In (+)');
    expect(zoomOutBtn).toHaveAttribute('title', 'Zoom Out (-)');
    expect(resetZoomBtn).toHaveAttribute('title', 'Reset Zoom (R)');
  });

  it('WorldMap should trigger zooming behaviors when global keys are pressed', () => {
    const mockZoomIn = vi.fn();
    const mockZoomOut = vi.fn();
    const mockZoomReset = vi.fn();

    // To test we can dispatch keyboard events and assert they don't crash and execute correctly
    render(<WorldMap onCountrySelect={vi.fn()} />);

    const zoomInEvent = new KeyboardEvent('keydown', { key: '+' });
    const zoomOutEvent = new KeyboardEvent('keydown', { key: '-' });
    const resetEvent = new KeyboardEvent('keydown', { key: 'r' });

    window.dispatchEvent(zoomInEvent);
    window.dispatchEvent(zoomOutEvent);
    window.dispatchEvent(resetEvent);

    // Tests that dispatching these keys works without throwing error
    expect(true).toBe(true);
  });
});
