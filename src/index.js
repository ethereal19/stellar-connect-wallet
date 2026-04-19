import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

console.log("Initializing React Root...");
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element not found! Falling back to document.body.");
  const fallbackRoot = document.createElement('div');
  fallbackRoot.id = 'root';
  document.body.appendChild(fallbackRoot);
  const root = ReactDOM.createRoot(fallbackRoot);
  console.log("Root created (fallback), rendering App...");
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  const root = ReactDOM.createRoot(rootElement);
  console.log("Root created, rendering App...");
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Render call finished.");
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
