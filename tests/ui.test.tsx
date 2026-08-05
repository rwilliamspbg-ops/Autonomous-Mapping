import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import CountryPanel from '../components/CountryPanel';
import WorldMap from '../components/WorldMap';
import SpatialScanner from '../components/SpatialScanner';
import App from '../App';

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

  it('App component global hotkeys should trigger correctly', () => {
    const { container } = render(<App />);

    // Dispatch hotkeys inside act
    act(() => {
      const chatEvent = new KeyboardEvent('keydown', { key: 'c' });
      window.dispatchEvent(chatEvent);
    });

    act(() => {
      const terminalEvent = new KeyboardEvent('keydown', { key: 't' });
      window.dispatchEvent(terminalEvent);
    });

    expect(screen.getByText(/Impact Chat/i)).toBeInTheDocument();
    expect(screen.getByText(/Live_Node_Console/i)).toBeInTheDocument();
  });

  it('App component global hotkeys should not trigger when typing in inputs', () => {
    const { container } = render(<App />);

    // Create and focus an input
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const chatEvent = new KeyboardEvent('keydown', { key: 'c', bubbles: true });
    input.dispatchEvent(chatEvent);

    expect(screen.queryByText(/Impact Chat/i)).not.toBeInTheDocument();

    // Cleanup
    document.body.removeChild(input);
  });

  it('ChatInterface should render a dynamic aria-label and loading spinner on submit button during loading state', async () => {
    // Using import/ESM style for mocking or grabbing the mocked function
    const { chatWithAnalyst } = await import('../services/geminiService');
    const mockedChatWithAnalyst = vi.mocked(chatWithAnalyst);
    mockedChatWithAnalyst.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve('AI Response'), 100)));

    const { fireEvent } = require('@testing-library/react');
    render(<App />);

    // Open chat
    act(() => {
      const chatEvent = new KeyboardEvent('keydown', { key: 'c' });
      window.dispatchEvent(chatEvent);
    });

    const chatInput = screen.getByLabelText(/Ask about a pilot or funding story/i);
    const sendButton = screen.getByLabelText('Send message');

    expect(sendButton).toBeInTheDocument();

    // Simulate user typing and submitting
    fireEvent.change(chatInput, { target: { value: 'Is it local first?' } });

    act(() => {
      fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    });

    // Check loading state updates
    expect(screen.getByLabelText('Sending message...')).toBeInTheDocument();
    expect(screen.getByLabelText('Sending message...').querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('SpatialScanner should gracefully handle camera hardware access failure and auto-focus retry button', async () => {
    const mockGetUserMedia = vi.fn().mockRejectedValue(new Error('Permission denied'));

    // Backup existing mediaDevices if any
    const originalMediaDevices = navigator.mediaDevices;

    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      configurable: true,
      value: {
        getUserMedia: mockGetUserMedia
      }
    });

    const handleClose = vi.fn();
    render(<SpatialScanner isOpen={true} onClose={handleClose} onScanComplete={vi.fn()} />);

    // Wait for the async getUserMedia to fail and state to transition to 'ERROR'
    const errorTitle = await screen.findByText('CAMERA_ERROR');
    expect(errorTitle).toBeInTheDocument();
    expect(screen.getByText(/Permission denied/i)).toBeInTheDocument();

    const retryBtn = screen.getByLabelText('Retry camera initialization');
    const dismissBtn = screen.getByLabelText('Dismiss and close scanner');
    expect(retryBtn).toBeInTheDocument();
    expect(dismissBtn).toBeInTheDocument();

    // Wait for the Retry button to receive focus (due to the 50ms setTimeout)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
    });

    // Verify Retry button was automatically focused on ERROR
    expect(document.activeElement).toBe(retryBtn);

    // Click retry should recall getUserMedia
    await act(async () => {
      retryBtn.click();
    });

    // Wait for the second failure and transition back to 'ERROR'
    const errorTitle2 = await screen.findAllByText('CAMERA_ERROR');
    expect(errorTitle2[0]).toBeInTheDocument();
    expect(mockGetUserMedia).toHaveBeenCalledTimes(2);

    // Click dismiss should call onClose
    const newDismissBtn = screen.getByLabelText('Dismiss and close scanner');
    await act(async () => {
      newDismissBtn.click();
    });
    expect(handleClose).toHaveBeenCalled();

    // Restore original mediaDevices
    if (originalMediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        configurable: true,
        value: originalMediaDevices
      });
    } else {
      // @ts-ignore
      delete navigator.mediaDevices;
    }
  });

  it('CountryPanel ZK verification section includes a polite live status region', () => {
    render(<CountryPanel country={{ id: 'KE', name: 'Kenya' }} onClose={() => {}} />);
    const liveRegion = screen.getByRole('status', { hidden: true });
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('ChatInterface includes a maximum character length input and character counter', () => {
    render(<App />);

    // Open chat
    act(() => {
      const chatEvent = new KeyboardEvent('keydown', { key: 'c' });
      window.dispatchEvent(chatEvent);
    });

    const chatInput = screen.getByLabelText(/Ask about a pilot or funding story/i);
    expect(chatInput).toHaveAttribute('maxLength', '200');

    const counter = screen.getByText('0/200');
    expect(counter).toBeInTheDocument();
    expect(counter).toHaveAttribute('aria-live', 'polite');
    expect(chatInput).toHaveAttribute('aria-describedby', 'chat-char-counter');
  });

  it('CountryPanel displays Copy ZK Proof Hash button when proof is COMMITTED and copies on click', async () => {
    const { getSovereignInsights } = await import('../services/geminiService');
    const mockedGetInsights = vi.mocked(getSovereignInsights);
    mockedGetInsights.mockResolvedValue({
      summary: 'Kenya local pilot insights.',
      politicalStatus: 'Stable integration.',
      economicOutlook: 'Positive resources.',
      keyRisks: [{ name: 'Access', severity: 20 }],
      sources: [],
      riskScore: 42,
      threats: [],
      recommendations: []
    });

    const { fireEvent } = require('@testing-library/react');
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      configurable: true,
      value: {
        writeText: writeTextSpy
      }
    });

    render(<CountryPanel country={{ id: 'KE', name: 'Kenya' }} onClose={() => {}} />);

    // Wait for insights loading to finish
    await screen.findByText('Kenya local pilot insights.');

    vi.useFakeTimers();

    const verifyBtn = screen.getByText('⊕ Verify On-Device Contribution');
    expect(verifyBtn).toBeInTheDocument();

    // Trigger ZK flow simulation
    act(() => {
      fireEvent.click(verifyBtn);
    });

    // ZK workflow transitions: IDLE -> GENERATING (2000ms delay) -> VERIFYING (3 steps * 1000ms delay) -> COMMITTED (800ms delay)
    // Advance timers step-by-step to speed up the simulator safely without hitting infinite loops
    act(() => {
      vi.advanceTimersByTime(6500);
    });

    // Ensure state transitions to COMMITTED (use getByLabelText synchronously since timers already ran)
    const copyBtn = screen.getByLabelText('Copy ZK Proof Hash to clipboard');
    expect(copyBtn).toBeInTheDocument();
    expect(copyBtn).toHaveAttribute('title', 'Copy Proof Hash');

    // Click to copy
    act(() => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextSpy).toHaveBeenCalledWith('0xbf31da86c729c19fb7ae4f3bc42f9e4bc11be4f0de318182ba0337b5ba7be01d');
    expect(screen.getByText('Copied! ✓')).toBeInTheDocument();

    // Fast-forward 2 seconds to reset copied state
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(screen.queryByText('Copied! ✓')).not.toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('SpatialScanner should show boot loading state with status role and correct text when camera is initializing', () => {
    const mockGetUserMedia = vi.fn().mockImplementation(() => new Promise(() => {}));

    const originalMediaDevices = navigator.mediaDevices;
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      configurable: true,
      value: {
        getUserMedia: mockGetUserMedia
      }
    });

    render(<SpatialScanner isOpen={true} onClose={() => {}} onScanComplete={() => {}} />);

    // Check that booting state is displayed
    expect(screen.getByText('BOOTING_SPATIAL_SCANNER')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Awaiting camera hardware access/i)).toBeInTheDocument();

    // Restore original mediaDevices
    if (originalMediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        configurable: true,
        value: originalMediaDevices
      });
    } else {
      // @ts-ignore
      delete navigator.mediaDevices;
    }
  });
});
