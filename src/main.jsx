import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/UI'

/**
 * Root Error Boundary to prevent full-app white screens
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Root ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-10 font-sans text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-8 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <Shield size={40} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-4">System Critical Error</h1>
          <p className="text-white/40 max-w-lg mb-8 leading-relaxed font-medium">
            The application encountered a fatal error and could not continue. Operational integrity has been compromised.
          </p>
          <div className="w-full max-w-2xl bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-10 overflow-hidden group">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 text-left border-b border-white/5 pb-2">Diagnostic Log</div>
            <pre className="text-[12px] text-red-400 font-mono text-left overflow-x-auto whitespace-pre-wrap">
              {this.state.error?.message}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-burnt-orange text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#ff6d2e] transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(230,90,31,0.4)] active:scale-95"
          >
            Restart Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>
  );
}
