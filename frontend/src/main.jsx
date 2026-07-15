import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './styles/globals.css'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '0.875rem',
            fontWeight: '500',
            borderRadius: '0.75rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
            maxWidth: '380px',
          },
          success: {
            iconTheme: { primary: '#16A34A', secondary: '#F0FDF4' },
          },
          error: {
            iconTheme: { primary: '#E11D48', secondary: '#FFF1F2' },
          },
          loading: {
            iconTheme: { primary: '#2563EB', secondary: '#EFF6FF' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
