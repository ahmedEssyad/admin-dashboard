import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Layout
import ClientLayout from '../components/layouts/ClientLayout';

// Pages critiques - Import direct pour éviter les problèmes de routage
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';

// Pages avec lazy loading
const CategoryPage = React.lazy(() => import('../pages/CategoryPage'));
const ProductPage = React.lazy(() => import('../pages/ProductPage'));
const SearchResults = React.lazy(() => import('../pages/SearchResults'));
const CompanyPage = React.lazy(() => import('../pages/CompanyPage'));
const AllCategories = React.lazy(() => import('../pages/AllCategories'));
const AllCompanies = React.lazy(() => import('../pages/AllCompanies'));
const AllProducts = React.lazy(() => import('../pages/AllProducts'));
const Cart = React.lazy(() => import('../pages/Cart'));
const Checkout = React.lazy(() => import('../pages/Checkout'));
const Wishlist = React.lazy(() => import('../pages/Wishlist'));

// Composant de chargement pour les pages lazy
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <CircularProgress />
  </Box>
);

function ClientRoutes() {
  return (
    <Routes>
      {/* Routes critiques - pas de lazy loading */}
      <Route path="/" element={
        <ClientLayout>
          <Home />
        </ClientLayout>
      } />
      
      <Route path="/404" element={
        <ClientLayout>
          <NotFound />
        </ClientLayout>
      } />
      
      {/* Routes avec lazy loading et Suspense local */}
      <Route path="/categories" element={
        <ClientLayout>
          <Suspense fallback={<PageLoader />}>
            <AllCategories />
          </Suspense>
        </ClientLayout>
      } />
      
      <Route path="/categories/:id" element={
        <ClientLayout>
          <Suspense fallback={<PageLoader />}>
            <CategoryPage />
          </Suspense>
        </ClientLayout>
      } />
      
      <Route path="/products/:id" element={
        <ClientLayout>
          <Suspense fallback={<PageLoader />}>
            <ProductPage />
          </Suspense>
        </ClientLayout>
      } />
      
      <Route path="/products/" element={
        <ClientLayout>
          <Suspense fallback={<PageLoader />}>
            <AllProducts />
          </Suspense>
        </ClientLayout>
      } />
      
      <Route path="/companies" element={
        <ClientLayout>
          <Suspense fallback={<PageLoader />}>
            <AllCompanies />
          </Suspense>
        </ClientLayout>
      } />
      
      <Route path="/companies/:id" element={
        <ClientLayout>
          <Suspense fallback={<PageLoader />}>
            <CompanyPage />
          </Suspense>
        </ClientLayout>
      } />
      
      <Route path="/search" element={
        <ClientLayout>
          <Suspense fallback={<PageLoader />}>
            <SearchResults />
          </Suspense>
        </ClientLayout>
      } />
      
      <Route path="/cart" element={
        <ClientLayout>
          <Suspense fallback={<PageLoader />}>
            <Cart />
          </Suspense>
        </ClientLayout>
      } />
      
      <Route path="/checkout" element={
        <ClientLayout>
          <Suspense fallback={<PageLoader />}>
            <Checkout />
          </Suspense>
        </ClientLayout>
      } />
      
      <Route path="/wishlist" element={
        <ClientLayout>
          <Suspense fallback={<PageLoader />}>
            <Wishlist />
          </Suspense>
        </ClientLayout>
      } />
      
      {/* Route catch-all - DOIT être la dernière */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default ClientRoutes;