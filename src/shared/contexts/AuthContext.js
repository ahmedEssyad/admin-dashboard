import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérification initiale de l'authentification
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Vérifier que le token est toujours valide et récupérer les informations à jour
        const response = await axiosInstance.get('/auth/verify');
        
        if (response.data.isAuthenticated) {
          const { admin } = response.data;
          
          setCurrentUser({
            id: admin.id,
            username: admin.username,
            firstName: admin.firstName || '',
            lastName: admin.lastName || '',
            email: admin.email || '',
            role: admin.role,
            permissions: admin.permissions
          });
          
          // Mettre à jour les informations dans le localStorage
          localStorage.setItem('username', admin.username);
          localStorage.setItem('role', admin.role);
        } else {
          // Si le token n'est plus valide, nettoyer le localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('role');
        }
      } catch (error) {
        console.error('Erreur de vérification d\'authentification:', error);
        // En cas d'erreur, supposer que l'authentification a échoué
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Fonction pour vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (resource, action) => {
    if (!currentUser || !currentUser.permissions) return false;
    
    // Super Admin a toutes les permissions
    if (currentUser.role === 'superAdmin') return true;
    
    return currentUser.permissions[resource] && 
           currentUser.permissions[resource][action] === true;
  };

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        username,
        password
      });
      
      const { token, username: user, role, firstName, lastName, permissions } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', user);
      localStorage.setItem('role', role);
      
      setCurrentUser({
        username: user,
        firstName: firstName || '',
        lastName: lastName || '',
        role,
        permissions
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      let errorMessage = 'Une erreur est survenue lors de la connexion.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
        } else if (error.response.status === 403) {
          errorMessage = 'Votre compte a été désactivé. Veuillez contacter un administrateur.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // Informer le serveur de déconnecter ce refreshToken
        await axiosInstance.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      setCurrentUser(null);
      
      // Rediriger vers la page de connexion avec window.location pour forcer un rechargement complet
      window.location.href = '/admin/login';
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axiosInstance.post('/auth/update-profile', profileData);
      
      const updatedUser = {
        ...currentUser,
        username: response.data.admin.username,
        firstName: response.data.admin.firstName || '',
        lastName: response.data.admin.lastName || '',
        email: response.data.admin.email || ''
      };
      
      setCurrentUser(updatedUser);
      localStorage.setItem('username', updatedUser.username);
      
      return { success: true, message: 'Profil mis à jour avec succès.' };
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      let errorMessage = 'Une erreur est survenue lors de la mise à jour du profil.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    updateProfile,
    hasPermission,
    isLoading: loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};