import React from 'react'

interface FallbackProps {
  error: Error
}

interface ErrorBoundaryPropsWithComponent {
  onError?: (error: Error, info: { componentStack: string }) => void
  FallbackComponent: React.ComponentType<FallbackProps>
}

type FallbackRender = (
  props: FallbackProps
) => React.ReactElement<unknown, string | React.FunctionComponent | typeof React.Component> | null

interface ErrorBoundaryPropsWithRender {
  onError?: (error: Error, info: { componentStack: string }) => void
  fallbackRender: FallbackRender
}

interface ErrorBoundaryPropsWithFallback {
  onError?: (error: Error, info: { componentStack: string }) => void
  fallback: React.ReactElement<
    unknown,
    string | React.FunctionComponent | typeof React.Component
  > | null
}

type ErrorBoundaryProps =
  | ErrorBoundaryPropsWithFallback
  | ErrorBoundaryPropsWithComponent
  | ErrorBoundaryPropsWithRender

interface ErrorBoundaryState {
  error: Error | null
}

const initialState: ErrorBoundaryState = { error: null }

class ErrorBoundary extends React.Component<
  React.PropsWithRef<React.PropsWithChildren<ErrorBoundaryProps>>,
  ErrorBoundaryState
> {
  // capture error
  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  state = initialState

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info)
  }

  render() {
    const { error } = this.state
    // @ts-expect-error ts(2339) (at least one of these will be defined though, and we check for their existence)
    const { fallbackRender, FallbackComponent, fallback } = this.props

    if (error !== null) {
      const props = {
        error,
      }

      if (React.isValidElement(fallback)) {
        return fallback
      } else if (typeof fallbackRender === 'function') {
        return (fallbackRender as FallbackRender)(props)
      } else if (FallbackComponent) {
        return <FallbackComponent {...props} />
      } else {
        return `Error Render: ${error?.message}`
      }
    }

    return this.props.children
  }
}

export default ErrorBoundary
