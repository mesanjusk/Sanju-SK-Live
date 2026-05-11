import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/common/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <FavoritesProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </FavoritesProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const response = await fetch('/service-worker.js', { method: 'GET' });
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok || !contentType.includes('javascript')) {
        console.warn('⚠️ Skipping ServiceWorker registration: invalid script response.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('✅ ServiceWorker registered:', registration.scope);
    } catch (error) {
      console.warn('⚠️ ServiceWorker registration skipped:', error?.message || error);
    }
  });
}
