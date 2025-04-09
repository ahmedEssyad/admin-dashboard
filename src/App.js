import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingScreen from './shared/components/LoadingScreen';

// Thèmes
import adminTheme from './admin/theme/adminTheme';
import clientTheme from './client/theme/clientTheme';

// Contextes
import { AuthProvider } from './shared/contexts/AuthContext';
import { CartProvider } from './shared/contexts/CartContext';
import { WishlistProvider } from './shared/contexts/WishlistContext';

// Lazy-loaded routes
const AdminRoutes = lazy(() => import('./admin/routes/AdminRoutes'));
const ClientRoutes = lazy(() => import('./client/routes/ClientRoutes'));

function App() {
  // Déterminer si nous sommes sur l'interface admin ou client
  // Utiliser pathname au lieu de hash pour BrowserRouter
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const currentTheme = isAdminRoute ? adminTheme : clientTheme;

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
              />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;