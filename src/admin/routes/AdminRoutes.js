import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import MainLayout from '../components/layouts/MainLayout';

// Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Categories from '../pages/Categories';
import Subcategories from '../pages/Subcategories';
import Companies from '../pages/Companies';
import Products from '../pages/Products';
import ProductEdit from '../pages/products/ProductEdit';
import Orders from '../pages/Orders';
import Promotions from '../pages/Promotions';
import Statistics from '../pages/Statistics';
import Profile from '../pages/Profile';
import AdminUsers from '../pages/AdminUsers';
import Settings from '../pages/Settings';

// Composants partagés
import ProtectedRoute from '../../shared/components/ProtectedRoute';

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      
      {/* Dashboard - accessible à tous les administrateurs */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Gestion des catégories - nécessite permissions spécifiques */}
      <Route
        path="categories"
        element={
          <ProtectedRoute requiredPermission={{ resource: 'categories', action: 'read' }}>
            <MainLayout>
              <Categories />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Gestion des sous-catégories - nécessite permissions spécifiques */}
      <Route
        path="subcategories"
        element={
          <ProtectedRoute requiredPermission={{ resource: 'categories', action: 'read' }}>
            <MainLayout>
              <Subcategories />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Gestion des entreprises - nécessite permissions spécifiques */}
      <Route
        path="companies"
        element={
          <ProtectedRoute requiredPermission={{ resource: 'companies', action: 'read' }}>
            <MainLayout>
              <Companies />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Gestion des produits - nécessite permissions spécifiques */}
      <Route
        path="products"
        element={
          <ProtectedRoute requiredPermission={{ resource: 'products', action: 'read' }}>
            <MainLayout>
              <Products />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Ajout/Édition d'un produit */}
      <Route
        path="products/edit/:id"
        element={
          <ProtectedRoute requiredPermission={{ resource: 'products', action: 'update' }}>
            <MainLayout>
              <ProductEdit />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Ajout d'un nouveau produit */}
      <Route
        path="products/new"
        element={
          <ProtectedRoute requiredPermission={{ resource: 'products', action: 'create' }}>
            <MainLayout>
              <ProductEdit />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Gestion des promotions - nécessite permissions spécifiques */}
      <Route
        path="promotions"
        element={
          <ProtectedRoute requiredPermission={{ resource: 'products', action: 'update' }}>
            <MainLayout>
              <Promotions />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Gestion des commandes - nécessite permissions spécifiques et n'est pas accessible au responsable produit */}
      <Route
        path="orders"
        element={
          <ProtectedRoute 
            requiredPermission={{ resource: 'orders', action: 'read' }}
            requiredRole="orderManager"
            allowSuperAdmin={true}
          >
            <MainLayout>
              <Orders />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Statistiques - accessible à tous les administrateurs */}
      <Route
        path="statistics"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Statistics />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Profil - accessible à tous les administrateurs */}
      <Route
        path="profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Paramètres - accessible à tous les administrateurs */}
      <Route
        path="settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Gestion des administrateurs - réservée aux superAdmin */}
      <Route
        path="admin-users"
        element={
          <ProtectedRoute requiredPermission={{ resource: 'admins', action: 'read' }}>
            <MainLayout>
              <AdminUsers />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route path="" element={<Navigate to="dashboard" replace />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

export default AdminRoutes;