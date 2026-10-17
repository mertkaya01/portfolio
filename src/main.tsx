import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are bundled with the site (no request to Google). Variable fonts: one file, every weight.
import '@fontsource-variable/big-shoulders'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
