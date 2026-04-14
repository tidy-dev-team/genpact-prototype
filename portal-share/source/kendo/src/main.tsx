import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import ComponentsShowcase from './pages/ComponentsShowcase'
import './index.css'
import '@progress/kendo-theme-default/dist/all.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/components" element={<ComponentsShowcase />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
