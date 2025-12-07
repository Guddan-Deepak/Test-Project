import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'

import App from './App.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SqlInjection from './pages/SqlInjection.jsx'
import XSS from './pages/XSS.jsx'
import RCE from './pages/RCE.jsx'
import TokenAbuse from './pages/TokenAbuse.jsx'
import BruteForce from './pages/BruteForce.jsx'
import Placeholder from './components/common/Placeholder.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index element={<Dashboard />} />
      <Route path='sqli' element={<SqlInjection />} />
      <Route path='xss' element={<XSS />} />
      <Route path='rce' element={<RCE />} />
      <Route path='token-abuse' element={<TokenAbuse />} />
      <Route path='port-scan' element={<Placeholder title="Port Scan" />} />
      <Route path='bruteforce' element={<BruteForce />} />
      <Route path='malware' element={<Placeholder title="File Upload Malware" />} />
      <Route path='ddos' element={<Placeholder title="DDoS Simulation" />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
