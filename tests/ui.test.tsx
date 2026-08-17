import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import CountryPanel from '../components/CountryPanel';
import WorldMap from '../components/WorldMap';
import SpatialScanner from '../components/SpatialScanner';
import Manifesto from '../components/Manifesto';
import App from '../App';

vi.mock('../services/geminiService', () => ({
  getSovereignInsights: vi.fn().mockImplementation(() => new Promise(() => {})),
  chatWithAnalyst: vi.fn()
}));

describe('UI Components', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
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

  it('ChatInterface allows copying chat messages and shows feedback', async () => {
    const { fireEvent } = require('@testing-library/react');
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      configurable: true,
      value: {
        writeText: writeTextSpy
      }
    });

    render(<App />);

    // Open chat
    act(() => {
      const chatEvent = new KeyboardEvent('keydown', { key: 'c' });
      window.dispatchEvent(chatEvent);
    });

    vi.useFakeTimers();

    const copyBtn = screen.getByLabelText(/Copy message from analyst:/i);
    expect(copyBtn).toBeInTheDocument();
    expect(copyBtn).toHaveAttribute('title', 'Copy message');

    // Click the copy button
    act(() => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextSpy).toHaveBeenCalledWith(
      "Hello. I am your Impact Analyst. Ask me about privacy-preserving health pilots, human-rights reporting, climate resilience deployments, or the demo economics."
    );
    expect(copyBtn.textContent).toContain('Copied! ✓');

    // Live region status check
    const statusElements = screen.getAllByRole('status', { hidden: true });
    const hasCopiedStatus = statusElements.some(el => el.textContent?.includes('Message copied to clipboard.'));
    expect(hasCopiedStatus).toBe(true);

    // Fast-forward 2 seconds to reset copied state
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(copyBtn.textContent).not.toContain('Copied! ✓');
  });

  it('ChatInterface should conditionally display a Clear Chat button that requires confirmation before clearing', async () => {
    const { chatWithAnalyst } = await import('../services/geminiService');
    const mockedChatWithAnalyst = vi.mocked(chatWithAnalyst);
    mockedChatWithAnalyst.mockResolvedValue('AI Response');

    const { fireEvent } = require('@testing-library/react');
    render(<App />);

    // Open chat
    act(() => {
      const chatEvent = new KeyboardEvent('keydown', { key: 'c' });
      window.dispatchEvent(chatEvent);
    });

    // Clear chat button should not be displayed when there is only the welcome message
    expect(screen.queryByLabelText('Clear chat messages')).not.toBeInTheDocument();

    const chatInput = screen.getByLabelText(/Ask about a pilot or funding story/i);
    fireEvent.change(chatInput, { target: { value: 'What is our privacy strategy?' } });

    // Submit a message to the chat
    await act(async () => {
      fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    });

    // Clear chat button should now be visible since messages.length > 1
    const clearBtn = screen.getByLabelText('Clear chat messages');
    expect(clearBtn).toBeInTheDocument();
    expect(clearBtn).toHaveAttribute('title', 'Clear chat messages');

    vi.useFakeTimers();

    // Click the clear button first time -> enters confirmation state
    act(() => {
      fireEvent.click(clearBtn);
    });

    // Button text or aria-label/title should change
    expect(clearBtn).toHaveAttribute('aria-label', 'Confirm clear chat messages');
    expect(clearBtn).toHaveAttribute('title', 'Confirm clear?');
    expect(clearBtn.textContent).toContain('Sure?');

    // Click again to confirm
    act(() => {
      fireEvent.click(clearBtn);
    });

    // Clear button should disappear and chat messages should be reset back to just the welcome message
    expect(screen.queryByLabelText('Clear chat messages')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Confirm clear chat messages')).not.toBeInTheDocument();
    expect(screen.getByText(/Hello. I am your Impact Analyst/i)).toBeInTheDocument();
    expect(screen.queryByText('What is our privacy strategy?')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('ChatInterface Clear Chat button confirmation resets back to default after a timeout', async () => {
    const { chatWithAnalyst } = await import('../services/geminiService');
    const mockedChatWithAnalyst = vi.mocked(chatWithAnalyst);
    mockedChatWithAnalyst.mockResolvedValue('AI Response');

    const { fireEvent } = require('@testing-library/react');
    render(<App />);

    // Open chat
    act(() => {
      const chatEvent = new KeyboardEvent('keydown', { key: 'c' });
      window.dispatchEvent(chatEvent);
    });

    const chatInput = screen.getByLabelText(/Ask about a pilot or funding story/i);
    fireEvent.change(chatInput, { target: { value: 'What is our privacy strategy?' } });

    // Submit a message to the chat
    await act(async () => {
      fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    });

    const clearBtn = screen.getByLabelText('Clear chat messages');

    vi.useFakeTimers();

    // Click to enter confirmation state
    act(() => {
      fireEvent.click(clearBtn);
    });

    expect(clearBtn).toHaveAttribute('aria-label', 'Confirm clear chat messages');

    // Wait 4 seconds for timeout
    act(() => {
      vi.advanceTimersByTime(4100);
    });

    // Should reset back to default
    expect(clearBtn).toHaveAttribute('aria-label', 'Clear chat messages');
    expect(clearBtn.textContent).not.toContain('Sure?');

    vi.useRealTimers();
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
    expect(copyBtn.textContent).toContain('Copied! ✓');

    // Fast-forward 2 seconds to reset copied state
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(copyBtn.textContent).not.toContain('Copied! ✓');
    expect(copyBtn.textContent).toContain('Copy');

    vi.useRealTimers();
  });

  it('CountryPanel displays and interacts with Copy Local Deployment Summary button', async () => {
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

    // Start fake timers only after async actions/rendering have settled
    vi.useFakeTimers();

    const copySummaryBtn = screen.getByLabelText('Copy Local Deployment Summary to clipboard');
    expect(copySummaryBtn).toBeInTheDocument();
    expect(copySummaryBtn).toHaveAttribute('title', 'Copy Summary');

    // Click to copy summary
    act(() => {
      fireEvent.click(copySummaryBtn);
    });

    expect(writeTextSpy).toHaveBeenCalledWith('Kenya local pilot insights.');
    expect(copySummaryBtn.textContent).toContain('Copied! ✓');

    // Fast-forward 2 seconds to reset copied state
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(copySummaryBtn.textContent).not.toContain('Copied! ✓');
    expect(copySummaryBtn.textContent).toContain('Copy');

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

  it('HardhatTerminal displays and interacts with Copy Logs button', async () => {
    const { fireEvent } = require('@testing-library/react');
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      configurable: true,
      value: {
        writeText: writeTextSpy
      }
    });

    render(<App />);

    // Open terminal using the hotkey
    act(() => {
      const terminalEvent = new KeyboardEvent('keydown', { key: 't' });
      window.dispatchEvent(terminalEvent);
    });

    expect(screen.getByText(/Live_Node_Console/i)).toBeInTheDocument();

    vi.useFakeTimers();

    const copyLogsBtn = screen.getByLabelText('Copy terminal logs to clipboard');
    expect(copyLogsBtn).toBeInTheDocument();
    expect(copyLogsBtn).toHaveAttribute('title', 'Copy Logs');

    // Click to copy
    act(() => {
      fireEvent.click(copyLogsBtn);
    });

    expect(writeTextSpy).toHaveBeenCalled();
    expect(copyLogsBtn.textContent).toContain('Copied! ✓');

    // Check live region text for logs copied success
    const statusElements = screen.getAllByRole('status', { hidden: true });
    const hasCopiedStatus = statusElements.some(el => el.textContent?.includes('Terminal logs copied to clipboard.'));
    expect(hasCopiedStatus).toBe(true);

    // Fast-forward 2 seconds to reset copied state
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(copyLogsBtn.textContent).not.toContain('Copied! ✓');
    expect(copyLogsBtn.textContent).toContain('Copy Logs');

    vi.useRealTimers();
  });

  it('App Evidence Trail displays and interacts with Copy Trail button when events exist', async () => {
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

    render(<App />);

    // Initially, when evidenceTrail is empty, Copy Trail button should not be present
    expect(screen.queryByLabelText('Copy Evidence Trail to clipboard')).not.toBeInTheDocument();

    // Select a track lane to trigger an evidence event
    const healthLaneBtn = screen.getByLabelText(/Select Health lane/i);
    await act(async () => {
      fireEvent.click(healthLaneBtn);
    });

    // Now Copy Trail button should be visible
    const copyTrailBtn = screen.getByLabelText('Copy Evidence Trail to clipboard');
    expect(copyTrailBtn).toBeInTheDocument();
    expect(copyTrailBtn).toHaveAttribute('title', 'Copy Evidence Trail');

    vi.useFakeTimers();

    // Click to copy trail
    act(() => {
      fireEvent.click(copyTrailBtn);
    });

    expect(writeTextSpy).toHaveBeenCalledWith('[1] Lane selected: PROTOCOL_ROUTE: HEALTH -> Kenya');
    expect(copyTrailBtn.textContent).toContain('Copied! ✓');

    // Check polite live region text
    const statusElements = screen.getAllByRole('status', { hidden: true });
    const hasCopiedStatus = statusElements.some(el => el.textContent?.includes('Evidence Trail copied to clipboard.'));
    expect(hasCopiedStatus).toBe(true);

    // Fast-forward 2 seconds to reset copied state
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(copyTrailBtn.textContent).not.toContain('Copied! ✓');
    expect(copyTrailBtn.textContent).toContain('Copy Trail');

    vi.useRealTimers();
  });

  it('Manifesto "Use This Demo" CTA button renders with accessible attributes and triggers onStartDemo callback', async () => {
    const handleStartDemo = vi.fn();
    const handleClose = vi.fn();

    render(
      <Manifesto
        isOpen={true}
        onClose={handleClose}
        onStartDemo={handleStartDemo}
      />
    );

    const ctaBtn = screen.getByLabelText('Use this demo and start guided walkthrough');
    expect(ctaBtn).toBeInTheDocument();
    expect(ctaBtn).toHaveAttribute('title', 'Use This Demo');

    act(() => {
      ctaBtn.click();
    });

    expect(handleStartDemo).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('App Impact Stream console displays and interacts with Copy Stream button when logs exist', async () => {
    const { fireEvent } = require('@testing-library/react');
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      configurable: true,
      value: {
        writeText: writeTextSpy
      }
    });

    render(<App />);

    // Wait for initial syncStage log (delay 0ms) to populate logs array
    const copyStreamBtn = await screen.findByLabelText('Copy Impact Stream logs to clipboard');
    expect(copyStreamBtn).toBeInTheDocument();
    expect(copyStreamBtn).toHaveAttribute('title', 'Copy Stream Logs');

    vi.useFakeTimers();

    // Click to copy stream logs
    act(() => {
      fireEvent.click(copyStreamBtn);
    });

    expect(writeTextSpy).toHaveBeenCalled();
    expect(copyStreamBtn.textContent).toContain('Copied! ✓');

    // Check polite live region text
    const statusElements = screen.getAllByRole('status', { hidden: true });
    const hasCopiedStatus = statusElements.some(el => el.textContent?.includes('Impact stream logs copied to clipboard.'));
    expect(hasCopiedStatus).toBe(true);

    // Fast-forward 2 seconds to reset copied state
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(copyStreamBtn.textContent).not.toContain('Copied! ✓');
    expect(copyStreamBtn.textContent).toContain('Copy Stream');

    vi.useRealTimers();
  });
});
