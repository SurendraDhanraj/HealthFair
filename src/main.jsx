import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from './App.jsx'
import './index.css'

// Fallback to local URL or show warning if VITE_CONVEX_URL is not set
const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://example.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>,
)
