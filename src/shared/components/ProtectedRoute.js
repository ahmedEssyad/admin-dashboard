import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  requiredPermission = null,  // Format: { resource: 'products', action: 'create' }
  allowSuperAdmin = true      // Par défaut, le superAdmin a tous les accès
}) => {
  const { currentUser, hasPermission, isLoading } = useAuth();
  const location = useLocation();

  // Vérifier d'abord si l'authenticité est toujours en cours de chargement
  if (isLoading) {
    // Vous pourriez afficher un spinner ici si nécessaire
    return <div>Chargement...</div>;
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!currentUser) {
    // Utilisez le format approprié pour la redirection avec HashRouter
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Cas spécial : bloquer certains rôles spécifiquement
  if (requiredRole === 'orderManager' && currentUser.role === 'productManager') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  if (requiredRole === 'productManager' && currentUser.role === 'orderManager') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  if (requiredRole === 'contentEditor' && 
      (currentUser.role === 'productManager' || currentUser.role === 'orderManager')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Vérifier le rôle requis
  if (requiredRole && 
      currentUser.role !== requiredRole && 
      !(allowSuperAdmin && currentUser.role === 'superAdmin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Vérifier la permission requise
  if (requiredPermission) {
    const { resource, action } = requiredPermission;
    if (!hasPermission(resource, action)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Si tout est OK, rendre les enfants
  return children;
};

export default ProtectedRoute;