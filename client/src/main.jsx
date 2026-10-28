import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './index.css';

import App from './App.jsx';
import { ToastProvider } from './hooks/useToast.jsx';
import { SummaryProvider } from './hooks/useSummary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <SummaryProvider>
          <App />
        </SummaryProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
