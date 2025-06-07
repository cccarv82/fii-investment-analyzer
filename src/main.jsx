import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { debugDY } from './lib/api/debug_dy_browser.js'
import { testBRAPIRangeOptions } from './lib/api/test_brapi_range.js'
import { testHybridMethod } from './lib/api/test_hybrid_method.js'

// Disponibilizar funções de debug globalmente
if (typeof window !== 'undefined') {
  window.debugDY = debugDY;
  window.testBRAPIRange = testBRAPIRangeOptions;
  window.testHybridMethod = testHybridMethod;
  console.log("🔍 Debug DY disponível: window.debugDY()");
  console.log("🔍 Teste BRAPI Range disponível: window.testBRAPIRange()");
  console.log("🚀 Teste Método Híbrido disponível: window.testHybridMethod()");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
