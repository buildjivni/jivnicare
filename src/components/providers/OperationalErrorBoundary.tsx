'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackOperationalEvent } from '@/lib/telemetry/client';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class OperationalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Log the error to telemetry asynchronously
    trackOperationalEvent({
      metric: 'frontendCrashes',
      metadata: {
        type: error.name || 'UnknownError',
        route: window.location.pathname,
        category: 'react_runtime'
      }
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-soft border border-red-100 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-500 font-medium mb-8">
              We encountered an unexpected error. Our team has been notified automatically. 
              Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
