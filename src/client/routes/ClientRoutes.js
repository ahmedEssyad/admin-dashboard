import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import ClientLayout from '../components/layouts/ClientLayout';

// Pages
import Home from '../pages/Home';
import CategoryPage from '../pages/CategoryPage';
import ProductPage from '../pages/ProductPage';
import SearchResults from '../pages/SearchResults';
import CompanyPage from '../pages/CompanyPage';
import AllCategories from '../pages/AllCategories';
import AllCompanies from '../pages/AllCompanies';
import AllProducts from '../pages/AllProducts';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout'; // Nouvelle page
import Wishlist from '../pages/Wishlist';
import NotFound from '../pages/NotFound';

function ClientRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <ClientLayout>
          <Home />
        </ClientLayout>
      } />
      <Route path="/categories" element={
        <ClientLayout>
          <AllCategories />
        </ClientLayout>
      } />
      <Route path="/categories/:id" element={
        <ClientLayout>
          <CategoryPage />
        </ClientLayout>
      } />
      <Route path="/products/:id" element={
        <ClientLayout>
          <ProductPage />
        </ClientLayout>
      } />
      <Route path="/products/" element={
        <ClientLayout>
          <AllProducts />
        </ClientLayout>
      } />
      <Route path="/companies" element={
        <ClientLayout>
          <AllCompanies />
        </ClientLayout>
      } />
      <Route path="/companies/:id" element={
        <ClientLayout>
          <CompanyPage />
        </ClientLayout>
      } />
      <Route path="/search" element={
        <ClientLayout>
          <SearchResults />
        </ClientLayout>
      } />
      <Route path="/cart" element={
        <ClientLayout>
          <Cart />
        </ClientLayout>
      } />
      <Route path="/checkout" element={
        <ClientLayout>
          <Checkout />
        </ClientLayout>
      } />
      <Route path="/wishlist" element={
        <ClientLayout>
          <Wishlist />
        </ClientLayout>
      } />
      <Route path="/404" element={
        <ClientLayout>
          <NotFound />
        </ClientLayout>
      } />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default ClientRoutes;