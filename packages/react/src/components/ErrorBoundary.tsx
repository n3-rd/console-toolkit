import { Component } from 'react'
import type { ReactNode, ErrorInfo, CSSProperties } from 'react'

/**
 * Props for StorachaErrorBoundary
 */
export interface ErrorBoundaryProps {
  children: ReactNode
  /**
   * Static fallback ReactNode to render on error
   */
  fallback?: ReactNode
  /**
   * Render prop for fallback UI with error details and reset capability.
   * Takes priority over `fallback` prop.
   */
  renderFallback?: (error: Error, reset: () => void) => ReactNode
  /**
   * Callback when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /**
   * Additional CSS class names for the default fallback wrapper
   */
  className?: string
  /**
   * Inline styles for the default fallback wrapper
   */
  style?: CSSProperties
}

/**
 * State for StorachaErrorBoundary
 */
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * Error boundary for Storacha Console Toolkit components.
 *
 * Catches render-time errors in any child component tree and displays
 * a fallback UI instead of crashing the entire application.
 *
 * Supports three fallback modes (in priority order):
 * 1. `renderFallback` render prop — receives the error and a reset function
 * 2. `fallback` prop — static ReactNode
 * 3. Default built-in fallback UI
 *
 * @example Basic usage
 * ```tsx
 * <StorachaErrorBoundary>
 *   <PlanGate>
 *     <PlanGate.Gate>
 *       <SpaceCreator />
 *     </PlanGate.Gate>
 *   </PlanGate>
 * </StorachaErrorBoundary>
 * ```
 *
 * @example With render prop fallback
 * ```tsx
 * <StorachaErrorBoundary
 *   renderFallback={(error, reset) => (
 *     <div>
 *       <p>Something went wrong: {error.message}</p>
 *       <button onClick={reset}>Try Again</button>
 *     </div>
 *   )}
 * >
 *   <UploadTool space={space} />
 * </StorachaErrorBoundary>
 * ```
 *
 * @example With static fallback
 * ```tsx
 * <StorachaErrorBoundary fallback={<p>Something went wrong.</p>}>
 *   <SharingTool />
 * </StorachaErrorBoundary>
 * ```
 *
 * @example With error tracking
 * ```tsx
 * <StorachaErrorBoundary
 *   onError={(error, errorInfo) => {
 *     analytics.track('Component Error', {
 *       message: error.message,
 *       componentStack: errorInfo.componentStack,
 *     })
 *   }}
 * >
 *   <SpaceList />
 * </StorachaErrorBoundary>
 * ```
 */
export class StorachaErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo)
  }

  reset = (): void => {
    this.setState({ hasError: false, error: undefined })
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.renderFallback) {
        return this.props.renderFallback(this.state.error, this.reset)
      }

      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={this.props.className} style={this.props.style}>
          <h3>⚠️ Something went wrong</h3>
          <p>{this.state.error.message}</p>
          <button onClick={this.reset} type="button">
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
