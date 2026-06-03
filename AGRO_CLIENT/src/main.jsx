import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

console.log("🚀 ¡Vite y React han cargado y ejecutado main.jsx correctamente!");

import { AuthProvider } from './context/AuthContext.jsx'
import AppRouter from './router/AppRouter.jsx'
import 'leaflet/dist/leaflet.css'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>,
)
