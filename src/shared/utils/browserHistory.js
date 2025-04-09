// Utilitaire pour gérer les redirections avec BrowserRouter
const browserHistory = {
  /**
   * Navigue vers un chemin spécifique
   * @param {string} path - Le chemin de destination
   */
  navigateTo: (path) => {
    window.history.pushState({}, '', path);
    // Déclencher un événement pour que le routeur détecte le changement
    window.dispatchEvent(new Event('popstate'));
  },

  /**
   * Recharge la page actuelle
   */
  reload: () => {
    window.location.reload();
  },

  /**
   * Remplace le chemin actuel
   * @param {string} path - Le nouveau chemin
   */
  replace: (path) => {
    window.history.replaceState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  }
};

export default browserHistory;
