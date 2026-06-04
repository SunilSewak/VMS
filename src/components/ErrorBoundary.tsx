import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: '#f8fafc',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            backgroundColor: '#ffffff',
            padding: '2.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ color: '#ef4444', fontSize: '1.75rem', marginBottom: '1rem' }}>Something went wrong</h1>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              An unexpected error occurred in the application interface.
            </p>
            <pre style={{
              backgroundColor: '#f1f5f9',
              padding: '1rem',
              borderRadius: '6px',
              textAlign: 'left',
              fontSize: '0.875rem',
              overflowX: 'auto',
              color: '#334155',
              marginBottom: '1.5rem'
            }}>
              {this.state.error?.toString() || 'Unknown Error'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
