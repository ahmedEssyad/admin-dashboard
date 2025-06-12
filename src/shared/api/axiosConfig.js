import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    // Ne pas définir Content-Type pour les requêtes FormData (upload de fichiers)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne pas rediriger automatiquement sur 401
    // Laisser le contexte d'authentification gérer les erreurs
    // Seulement nettoyer le localStorage si c'est vraiment une erreur d'auth
    if (error.response && error.response.status === 401) {
      // Ne pas rediriger immédiatement, laisser le composant gérer
      console.log('Token expired or invalid - cleaning localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    }
    return Promise.reject(error);
  }
);

// Simple cache implementation without external dependency
const apiCache = {
  cache: new Map(),
  maxAge: 5 * 60 * 1000, // 5 minutes default
  
  get(key) {
    if (!this.cache.has(key)) return null;
    
    const { data, timestamp } = this.cache.get(key);
    const now = Date.now();
    
    if (now - timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return data;
  },
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  },
  
  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
};

/**
 * Get data with cache support
 * @param {string} url - API endpoint
 * @param {Object} options - Axios request options
 * @param {boolean} options.useCache - Whether to use cache
 * @param {number} options.cacheTime - Cache duration in ms
 * @returns {Promise<any>} - API response
 */
export const getCached = async (url, { useCache = true, cacheTime, ...config } = {}) => {
  if (useCache) {
    const cachedData = apiCache.get(url);
    if (cachedData) {
      return { data: cachedData, fromCache: true };
    }
  }
  
  const response = await axiosInstance.get(url, config);
  
  if (useCache) {
    apiCache.set(url, response.data);
  }
  
  return response;
};

export default axiosInstance;