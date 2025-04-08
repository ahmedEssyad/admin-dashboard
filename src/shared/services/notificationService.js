import axiosInstance from '../api/axiosConfig';

/**
 * Service pour la gestion des notifications côté client
 */
const notificationService = {
  /**
   * Récupère les notifications de l'utilisateur connecté
   * @param {Object} params - Paramètres de la requête
   * @param {number} params.limit - Limite de résultats
   * @param {number} params.skip - Nombre de résultats à sauter (pagination)
   * @param {boolean} params.read - Filtrer par statut de lecture
   * @returns {Promise<Object>} - Réponse contenant les notifications, le total et le nombre de non lues
   */
  getNotifications: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  },
  
  /**
   * Marque une notification comme lue
   * @param {string} id - ID de la notification
   * @returns {Promise<Object>} - La notification mise à jour
   */
  markAsRead: async (id) => {
    try {
      const response = await axiosInstance.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
      throw error;
    }
  },
  
  /**
   * Marque toutes les notifications comme lues
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  markAllAsRead: async () => {
    try {
      const response = await axiosInstance.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error);
      throw error;
    }
  },
  
  /**
   * Supprime une notification
   * @param {string} id - ID de la notification
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  deleteNotification: async (id) => {
    try {
      const response = await axiosInstance.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  },
  
  /**
   * Récupère le nombre de notifications non lues
   * @returns {Promise<number>} - Nombre de notifications non lues
   */
  getUnreadCount: async () => {
    try {
      const response = await axiosInstance.get('/notifications', { 
        params: { limit: 1, read: false }
      });
      return response.data.unreadCount;
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de notifications:', error);
      throw error;
    }
  }
};

export default notificationService;
