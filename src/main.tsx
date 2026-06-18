import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('error', e => {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;z-index:9999;background:red;color:white;padding:20px;';
  div.innerText = 'Global Error: ' + e.message;
  document.body.appendChild(div);
});
window.addEventListener('unhandledrejection', e => {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;z-index:9999;background:darkred;color:white;padding:20px;';
  div.innerText = 'Promise Rejection: ' + (e.reason && e.reason.message ? e.reason.message : e.reason);
  document.body.appendChild(div);
});

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Component Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 20, color: 'red', background: '#fff', fontSize: '20px', minHeight: '100vh'}}>
          <h1>React Render Error</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre style={{fontSize: '12px', marginTop: '20px'}}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (e: any) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;z-index:9999;background:red;color:white;padding:20px;';
  div.innerText = 'Render Error: ' + e.message;
  document.body.appendChild(div);
}

