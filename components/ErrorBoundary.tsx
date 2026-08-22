import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-slate-950 flex items-center justify-center p-6 mono text-white"
        >
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
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              The Sovereign Map core encountered an unexpected state.
            </p>
            <button
              onClick={() => window.location.reload()}
              aria-label="Reinitialize core and reload application"
              title="Reinitialize Core (Reload)"
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-red-500 outline-none cursor-pointer"
            >
              Reinitialize_Core
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
