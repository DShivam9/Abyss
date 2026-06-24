"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  zoneName?: string;
}

interface State {
  hasError: boolean;
}

export default class ZoneErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[${this.props.zoneName || "Zone"}] Error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full min-h-[50vh] flex items-center justify-center bg-bg-base">
            <p className="font-sans text-sm text-fg-muted uppercase tracking-widest">
              Section unavailable
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
