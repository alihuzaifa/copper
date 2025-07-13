import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from './store/store';
import { queryClient } from './lib/queryClient';
import App from './App';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
