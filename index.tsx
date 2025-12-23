import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  // StrictMode removed to prevent double-initialization of Nostalgist in dev mode, 
  // which can cause issues with WASM memory allocation in some contexts.
  <App />
);