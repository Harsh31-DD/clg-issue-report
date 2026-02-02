import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/UI'

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color: white; background: #0B0B0B; height: 100vh; display: grid; place-items: center; font-family: sans-serif;"><h1>Mount Error: #root missing</h1></div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </StrictMode>
    );
  } catch (error) {
    console.error('[main.jsx] Render crash:', error);
    rootElement.innerHTML = `<div style="color: #ff6b6b; background: #0B0B0B; height: 100vh; padding: 40px; font-family: monospace;"><h1>React Render Error</h1><pre>${error.message}</pre></div>`;
  }
}
