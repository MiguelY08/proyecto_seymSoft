import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AlertProvider } from './Features/shared/alerts/AlertContext.jsx';
import { AuthProvider } from './Features/access/context/AuthContext.jsx';
import { initSystem } from './system/initSystem.js';
import { FavoritesProvider } from './Features/shared/Context/Favoritescontext.jsx';

// Inicializar el sistema con datos predeterminados
initSystem()


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
          <FavoritesProvider>
          <App />
          </FavoritesProvider>
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);