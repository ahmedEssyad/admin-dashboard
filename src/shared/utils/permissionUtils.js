/**
 * Utilitaires pour gérer les permissions et les rôles
 */

/**
 * Définit les permissions par défaut pour chaque rôle
 * @param {string} role - Le rôle pour lequel définir les permissions par défaut
 * @returns {Object} - Un objet de permissions structuré
 */
export const getDefaultPermissions = (role) => {
  // Structure de base des permissions (tout est refusé par défaut)
  const basePermissions = {
    products: { create: false, read: false, update: false, delete: false },
    categories: { create: false, read: false, update: false, delete: false },
    subcategories: { create: false, read: false, update: false, delete: false },
    orders: { create: false, read: false, update: false, delete: false },
    companies: { create: false, read: false, update: false, delete: false },
    admins: { create: false, read: false, update: false, delete: false }
  };

  // Permissions spécifiques à chaque rôle
  switch (role) {
    case 'superAdmin':
      // Accès complet à tout
      Object.keys(basePermissions).forEach(resource => {
        Object.keys(basePermissions[resource]).forEach(action => {
          basePermissions[resource][action] = true;
        });
      });
      break;

    case 'productManager':
      // Accès complet aux produits
      basePermissions.products = { create: true, read: true, update: true, delete: true };
      // Lecture seule pour les catégories et entreprises (pour la création de produits)
      basePermissions.categories.read = true;
      basePermissions.subcategories.read = true;
      basePermissions.companies.read = true;
      break;

    case 'orderManager':
      // Accès complet aux commandes
      basePermissions.orders = { create: true, read: true, update: true, delete: true };
      // Lecture seule pour les produits (pour voir les détails des commandes)
      basePermissions.products.read = true;
      break;

    case 'contentEditor':
      // Accès aux catégories, sous-catégories et entreprises (sans suppression)
      basePermissions.categories = { create: true, read: true, update: true, delete: false };
      basePermissions.subcategories = { create: true, read: true, update: true, delete: false };
      basePermissions.companies = { create: true, read: true, update: true, delete: false };
      // Lecture et mise à jour des produits (pour modifier les descriptions)
      basePermissions.products.read = true;
      basePermissions.products.update = true;
      break;

    default:
      // Pour tout autre rôle, donner accès en lecture uniquement
      Object.keys(basePermissions).forEach(resource => {
        basePermissions[resource].read = true;
      });
  }

  return basePermissions;
};

/**
 * Vérifie si un utilisateur a une permission spécifique
 * @param {Object} user - L'objet utilisateur avec ses permissions
 * @param {string} resource - La ressource à vérifier (products, categories, etc.)
 * @param {string} action - L'action à vérifier (create, read, update, delete)
 * @returns {boolean} - True si l'utilisateur a la permission, sinon false
 */
export const checkPermission = (user, resource, action) => {
  // Les super admins ont toutes les permissions
  if (user?.role === 'superAdmin') {
    return true;
  }

  // Vérifier si la permission spécifique existe
  return user?.permissions?.[resource]?.[action] === true;
};

/**
 * Vérifie si un utilisateur peut voir un élément de menu particulier
 * @param {Object} user - L'objet utilisateur avec ses permissions
 * @param {string} menuItem - L'identifiant de l'élément de menu
 * @returns {boolean} - True si l'élément devrait être visible, sinon false
 */
export const canSeeMenuItem = (user, menuItem) => {
  if (!user) return false;

  // Éléments visibles pour tous les utilisateurs authentifiés
  const commonMenuItems = ['dashboard', 'profile', 'statistics'];
  if (commonMenuItems.includes(menuItem)) {
    return true;
  }

  // Vérifications spécifiques pour chaque élément de menu
  switch (menuItem) {
    case 'products':
      return checkPermission(user, 'products', 'read');
    case 'categories':
    case 'subcategories':
      return checkPermission(user, 'categories', 'read');
    case 'companies':
      return checkPermission(user, 'companies', 'read');
    case 'orders':
      return checkPermission(user, 'orders', 'read');
    case 'promotions':
      return checkPermission(user, 'products', 'update');
    case 'admin-users':
      return checkPermission(user, 'admins', 'read');
    default:
      return false;
  }
};

/**
 * Obtient un libellé lisible pour un rôle
 * @param {string} role - L'identifiant du rôle
 * @returns {string} - Le libellé du rôle
 */
export const getRoleLabel = (role) => {
  const roleLabels = {
    superAdmin: 'Super Admin',
    productManager: 'Responsable des produits',
    orderManager: 'Responsable des commandes',
    contentEditor: 'Éditeur de contenu'
  };

  return roleLabels[role] || role;
};

/**
 * Formatte une permission pour l'affichage
 * @param {string} resource - La ressource (products, categories, etc.)
 * @param {string} action - L'action (create, read, update, delete)
 * @returns {string} - Le libellé formaté de la permission
 */
export const formatPermission = (resource, action) => {
  const resourceLabels = {
    products: 'Produits',
    categories: 'Catégories',
    subcategories: 'Sous-catégories',
    orders: 'Commandes',
    companies: 'Entreprises',
    admins: 'Administrateurs'
  };
  
  const actionLabels = {
    create: 'Créer',
    read: 'Voir',
    update: 'Modifier',
    delete: 'Supprimer'
  };

  return `${actionLabels[action] || action} ${resourceLabels[resource] || resource}`;
};