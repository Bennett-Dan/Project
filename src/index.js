import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { SettingsProvider } from './contexts/SettingsContext';
import { ModelProvider } from './contexts/ModelContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <ModelProvider>
          <App />
        </ModelProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
); 