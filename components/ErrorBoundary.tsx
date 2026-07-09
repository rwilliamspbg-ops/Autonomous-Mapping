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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 mono text-white">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 p-8 rounded-2xl">
            <h1 className="text-xl font-black uppercase text-red-500 mb-4">System Anomaly Detected</h1>
            <p className="text-slate-400 text-sm mb-6">The Sovereign Map core encountered an unexpected state.</p>
            <button onClick={() => window.location.reload()} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-black text-xs uppercase tracking-widest">Reinitialize_Core</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
