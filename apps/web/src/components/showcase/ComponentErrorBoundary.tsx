"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackSlug?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component render:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-[#070708] text-white font-mono text-center">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-4 text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-200 mb-2">
            Component Render Error
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mb-6 leading-relaxed">
            The component canvas encountered an unexpected runtime error. This might be due to WebGL context loss or shader compilation.
          </p>
          {this.state.error && (
            <pre className="text-[11px] text-red-400/90 bg-neutral-900/90 p-3 rounded-lg border border-neutral-800 max-w-lg overflow-x-auto mb-6 text-left">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload Canvas</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
