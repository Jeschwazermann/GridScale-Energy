import { Component } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    /* Log to console in dev — swap for a real logger (Sentry etc.) in prod */
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle
              size={28}
              className="text-red-500"
              strokeWidth={1.8}
            />
          </div>

          {/* Message */}
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              An unexpected error occurred on this page. Your data is safe —
              this is a display issue, not a data loss.
            </p>
          </div>

          {/* Error detail — dev only */}
          {import.meta.env.DEV && this.state.error && (
            <div className="bg-gray-100 rounded-xl px-4 py-3 text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Error detail (dev only)
              </p>
              <p className="text-xs text-red-600 font-mono break-all">
                {this.state.error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
            <Link
              to="/installer/dashboard"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
            >
              <LayoutDashboard size={15} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
