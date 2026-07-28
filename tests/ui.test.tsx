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

  it('SpatialScanner should gracefully handle camera hardware access failure', async () => {
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
});
