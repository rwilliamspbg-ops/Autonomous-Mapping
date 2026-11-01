import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  copied?: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  private copyTimer: number | null = null;

  public state: State = {
    hasError: false,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public componentWillUnmount() {
    if (this.copyTimer) {
      window.clearTimeout(this.copyTimer);
    }
  }

  private handleCopyError = () => {
    const errorDetails = this.state.error
      ? `System Anomaly: ${this.state.error.name || 'Error'}: ${this.state.error.message}`
      : 'System Anomaly Detected: Unknown runtime error';
    navigator.clipboard.writeText(errorDetails);
    this.setState({ copied: true });
    if (this.copyTimer) window.clearTimeout(this.copyTimer);
    this.copyTimer = window.setTimeout(() => {
      this.setState({ copied: false });
    }, 2000);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-slate-950 flex items-center justify-center p-6 mono text-white"
        >
          <div role="status" aria-live="polite" className="sr-only">
            {this.state.copied ? 'Diagnostic error details copied to clipboard.' : ''}
          </div>
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.15)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-red-500/20 pb-3">
              <h1 className="text-xl font-black uppercase text-red-500 flex items-center gap-2 tracking-tight">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                System Anomaly Detected
              </h1>
              <span className="text-[9px] text-red-400/80 uppercase font-mono tracking-widest px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10">
                CRITICAL_ERR
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              The Sovereign Map core encountered an unexpected state.
            </p>
            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-red-950/40 border border-red-500/20 rounded-xl font-mono text-[11px] text-red-300/90 break-words font-medium">
                <span className="text-red-500 font-bold mr-1">DETAILS:</span>
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={this.handleCopyError}
                aria-label="Copy error details to clipboard"
                title="Copy Error Details"
                className="flex-1 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer"
              >
                {this.state.copied ? 'Copied! ✓' : 'Copy_Error'}
              </button>
              <button
                onClick={() => window.location.reload()}
                aria-label="Reinitialize core and reload application"
                title="Reinitialize Core (Reload)"
                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-red-500 outline-none cursor-pointer"
              >
                Reinitialize_Core
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
