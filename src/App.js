import React, { lazy, Suspense, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingScreen from './shared/components/LoadingScreen';

// Thèmes
import createAdminTheme from './admin/theme/createAdminTheme';
import clientTheme from './client/theme/clientTheme';

// Contextes
import { AuthProvider } from './shared/contexts/AuthContext';
import { CartProvider } from './shared/contexts/CartContext';
import { WishlistProvider } from './shared/contexts/WishlistContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './shared/contexts/ThemeContext';

// Lazy-loaded routes avec préchargement
const AdminRoutes = lazy(() => 
  import('./admin/routes/AdminRoutes').then(module => {
    console.log('AdminRoutes loaded');
    return module;
  })
);

const ClientRoutes = lazy(() => 
  import('./client/routes/ClientRoutes').then(module => {
    console.log('ClientRoutes loaded');
    return module;
  })
);

// Composant wrapper qui applique le thème MUI
function ThemedApp() {
  const { darkMode } = useTheme();
  
  // Déterminer si nous sommes sur l'interface admin ou client
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  // Précharger les routes au démarrage pour éviter les problèmes de 404
  useEffect(() => {
    if (isAdminRoute) {
      import('./admin/routes/AdminRoutes');
    } else {
      import('./client/routes/ClientRoutes');
    }
  }, [isAdminRoute]);
  
  // Créer le thème en fonction du mode (clair ou sombre)
  const currentTheme = useMemo(() => {
    if (isAdminRoute) {
      return createAdminTheme(darkMode ? 'dark' : 'light');
    } else {
      // Pour l'instant, on utilise le thème client existant
      // À terme, il faudrait aussi adapter le thème client pour le mode sombre
      return clientTheme;
    }
  }, [darkMode, isAdminRoute]);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Routes d'administration */}
                  <Route path="/admin/*" element={<AdminRoutes />} />
                  
                  {/* Routes client */}
                  <Route path="/*" element={<ClientRoutes />} />
                </Routes>
              </Suspense>
              <ToastContainer 
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={darkMode ? 'dark' : 'light'} // Adapter les notifications au thème
              />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <CustomThemeProvider>
      <ThemedApp />
    </CustomThemeProvider>
  );
}

export default App;
