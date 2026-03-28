"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Reusable React Error Boundary component
 * Wraps client components and catches JavaScript errors anywhere in the tree
 * Shows a beautiful error UI matching the app's dark theme
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
          <div className="w-full max-w-md">
            <div className="panel-surface p-8 text-center">
              {/* Error Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D2A85A] to-[#8B6B47] flex items-center justify-center">
                  <span className="text-2xl">⚔️</span>
                </div>
              </div>

              {/* Heading */}
              <h1 className="font-cinzel font-bold text-2xl mb-2 text-ink tracking-wide">
                משהו השתבש
              </h1>
              <p className="text-sm text-ink-soft mb-6 leading-relaxed">
                קרתה שגיאה לא צפויה. אנא נסה שוב.
              </p>

              {/* Error Details */}
              {this.state.error.message && (
                <div className="mb-6 p-4 rounded-lg bg-[rgba(28,33,50,0.6)] border border-[rgba(210,168,90,0.1)]">
                  <p className="text-xs font-mono text-muted break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Divider */}
              <hr className="got-divider my-6" />

              {/* Action Button */}
              <button
                onClick={this.resetError}
                className="w-full px-4 py-3 rounded-lg font-heebo font-medium text-sm transition-all duration-200
                  bg-gradient-to-br from-[#D2A85A] to-[#B8945A]
                  text-[#080A10]
                  hover:from-[#E8C573] hover:to-[#D2A85A]
                  active:scale-95
                  shadow-lg hover:shadow-xl"
              >
                נסה שוב
              </button>

              {/* Decorative gold accent line */}
              <div
                className="mt-6 h-0.5 w-12 mx-auto rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent, rgb(210,168,90), transparent)",
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
