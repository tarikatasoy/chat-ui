// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux' // Eklendi
import { store } from './store' // Eklendi
import './index.css'
import App from './App' // .tsx uzantısını kaldırdık

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}> {/* Eklendi */}
      <App />
    </Provider> {/* Eklendi */}
  </StrictMode>,
)