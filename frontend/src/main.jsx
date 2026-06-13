import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app.scss'
import App from './App.jsx'
import 'bootstrap/scss/bootstrap.scss'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
