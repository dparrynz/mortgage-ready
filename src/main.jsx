import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MortgageReadySandbox from '../MortgageReadySandbox.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MortgageReadySandbox />
  </StrictMode>,
)
