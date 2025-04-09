import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import axiosInstance from '../../shared/api/axiosConfig';

/**
 * Hook personnalisé pour gérer toute la logique métier liée aux produits
 * @returns {Object} - Méthodes et états liés à la gestion des produits
 */
const useProducts = () => {
  // États pour les données
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // États pour les formulaires
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    features: '',
    oldPrice: '',
    quantite: '0',
    Company_id: '',
    categoriesa_id: [],
    subcategories_id: [],
    productType: 'simple'
  });
  
  const [discountData, setDiscountData] = useState({
    discountedPrice: '',
    discountDuration: ''
  });
  
  // États pour les images
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // États pour la pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  
  // États pour les dialogues
  const [openDialog, setOpenDialog] = useState(false);
  const [openDiscountDialog, setOpenDiscountDialog] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [confirmDiscountRemovalDialog, setConfirmDiscountRemovalDialog] = useState({ open: false, id: null });
  
  // États pour le mode d'édition
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // État pour le chargement
  const [loading, setLoading] = useState(true);

  // Charge les produits à chaque changement de page
  useEffect(() => {
    fetchProducts();
  }, [page]);

  // Charge les catégories, sous-catégories et entreprises au chargement initial
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchCompanies();
  }, []);

  // Filtre les sous-catégories en fonction des catégories sélectionnées
  useEffect(() => {
    if (formData.categoriesa_id && formData.categoriesa_id.length > 0) {
      const filtered = subcategories.filter(sub => {
        const categoryId = sub.categories_id?._id || sub.categories_id;
        return categoryId && formData.categoriesa_id.includes(categoryId);
      });
      setAvailableSubcategories(filtered);
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.categoriesa_id, subcategories]);

  /**
   * Récupère la liste des produits depuis l'API
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/products');
      setProducts(response.data);
      setTotalPages(Math.ceil(response.data.length / rowsPerPage));
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Impossible de charger les produits');
      setLoading(false);
    }
  };

  /**
   * Récupère la liste des catégories depuis l'API
   */
  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast.error('Impossible de charger les catégories');
    }
  };

  /**
   * Récupère la liste des sous-catégories depuis l'API
   */
  const fetchSubcategories = async () => {
    try {
      const response = await axiosInstance.get('/subcategories');
      setSubcategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error);
      toast.error('Impossible de charger les sous-catégories');
    }
  };

  /**
   * Récupère la liste des entreprises depuis l'API
   */
  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
      toast.error('Impossible de charger les entreprises');
    }
  };

  /**
   * Ouvre le dialogue d'ajout/modification de produit
   * @param {Object} product - Produit à modifier
   */
  const handleOpenDialog = (product = null) => {
    if (product) {
      // Conversion des tableaux d'objets en tableaux d'IDs
      const categoriesIds = product.categoriesa_id.map(cat => 
        typeof cat === 'object' ? cat._id : cat
      );
      const subcategoriesIds = product.subcategories_id.map(sub => 
        typeof sub === 'object' ? sub._id : sub
      );

      setFormData({
        nom: product.nom,
        description: product.description || '',
        features: product.features || '',
        oldPrice: product.oldPrice.toString(),
        quantite: (product.quantite !== undefined && product.quantite !== null) ? product.quantite.toString() : '0',
        Company_id: product.Company_id._id || product.Company_id,
        categoriesa_id: categoriesIds,
        subcategories_id: subcategoriesIds,
        productType: product.productType || 'simple'
      });
      setImagePreviews(product.pictures || []);
      setEditMode(true);
      setCurrentId(product._id);
    } else {
      setFormData({
        nom: '',
        description: '',
        features: '',
        oldPrice: '',
        quantite: '0',
        Company_id: '',
        categoriesa_id: [],
        subcategories_id: [],
        productType: 'simple'
      });
      setSelectedImages([]);
      setImagePreviews([]);
      setEditMode(false);
      setCurrentId(null);
    }
    setOpenDialog(true);
  };

  /**
   * Ouvre le dialogue d'ajout/modification de remise
   * @param {Object} product - Produit pour lequel modifier la remise
   */
  const handleOpenDiscountDialog = (product) => {
    setCurrentId(product._id);
    setDiscountData({
      discountedPrice: product.discountedPrice?.toString() || '',
      discountDuration: product.discountDuration 
        ? format(new Date(product.discountDuration), 'yyyy-MM-dd')
        : format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') // 7 jours par défaut
    });
    setOpenDiscountDialog(true);
  };

  /**
   * Ouvre le dialogue de gestion des images
   * @param {Object} product - Produit pour lequel gérer les images
   */
  const handleOpenImageDialog = (product) => {
    setSelectedProduct(product);
    setImagePreviews(product.pictures || []);
    setOpenImageDialog(true);
  };

  /**
   * Ferme le dialogue d'ajout/modification de produit
   */
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      nom: '',
      description: '',
      features: '',
      oldPrice: '',
      quantite: '0',
      Company_id: '',
      categoriesa_id: [],
      subcategories_id: [],
      productType: 'simple'
    });
    setSelectedImages([]);
    setImagePreviews([]);
  };

  /**
   * Ferme le dialogue d'ajout/modification de remise
   */
  const handleCloseDiscountDialog = () => {
    setOpenDiscountDialog(false);
    setDiscountData({
      discountedPrice: '',
      discountDuration: ''
    });
  };

  /**
   * Ferme le dialogue de gestion des images
   */
  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
    setSelectedProduct(null);
    setSelectedImages([]);
  };

  /**
   * Gère le changement des champs du formulaire produit
   * @param {Event} e - Événement de changement
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Gère le changement des champs du formulaire de remise
   * @param {Event} e - Événement de changement
   */
  const handleDiscountInputChange = (e) => {
    const { name, value } = e.target;
    setDiscountData({ ...discountData, [name]: value });
  };

  /**
   * Gère le changement des images
   * @param {Event} e - Événement de changement
   */
  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages([...selectedImages, ...filesArray]);
      
      const newImagePreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newImagePreviews]);
    }
  };

  /**
   * Supprime une image du tableau d'images sélectionnées
   * @param {number} index - Index de l'image à supprimer
   */
  const handleRemoveImage = (index) => {
    const newSelectedImages = [...selectedImages];
    newSelectedImages.splice(index, 1);
    setSelectedImages(newSelectedImages);

    const newImagePreviews = [...imagePreviews];
    newImagePreviews.splice(index, 1);
    setImagePreviews(newImagePreviews);
  };

  /**
   * Supprime une image déjà enregistrée sur le serveur
   * @param {string} productId - ID du produit
   * @param {number} imageIndex - Index de l'image à supprimer
   */
  const handleRemoveServerImage = async (productId, imageIndex) => {
    try {
      await axiosInstance.delete(`/products/${productId}/image/${imageIndex}`);
      toast.success('Image supprimée avec succès');
      
      // Mettre à jour les aperçus d'images
      const newImagePreviews = [...imagePreviews];
      newImagePreviews.splice(imageIndex, 1);
      setImagePreviews(newImagePreviews);
      
      // Recharger les produits pour mettre à jour la liste
      fetchProducts();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
      toast.error("Erreur lors de la suppression de l'image");
    }
  };

  /**
   * Enregistre un produit (création ou modification)
   */
  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('features', formData.features);
      formDataToSend.append('oldPrice', formData.oldPrice);
      formDataToSend.append('productType', formData.productType);
      
      // N'ajouter la quantité que pour les produits simples
      if (formData.productType === 'simple') {
        formDataToSend.append('quantite', formData.quantite);
      }
      
      formDataToSend.append('Company_id', formData.Company_id);
      
      // Ajouter les catégories et sous-catégories
      formData.categoriesa_id.forEach(catId => {
        formDataToSend.append('categoriesa_id', catId);
      });
      
      formData.subcategories_id.forEach(subId => {
        formDataToSend.append('subcategories_id', subId);
      });
      
      // Ajouter les images si disponibles
      selectedImages.forEach(image => {
        formDataToSend.append('pictures', image);
      });

      let response;
      if (editMode) {
        response = await axiosInstance.put(`/products/${currentId}`, formDataToSend);
        toast.success('Produit mis à jour avec succès');
      } else {
        response = await axiosInstance.post('/products', formDataToSend);
        toast.success('Produit créé avec succès');
      }

      handleCloseDialog();
      fetchProducts();
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du produit:", error);
      toast.error("Erreur lors de l'enregistrement du produit: " + (error.response?.data?.message || error.message));
      return { success: false, error };
    }
  };

  /**
   * Enregistre une remise pour un produit
   */
  const handleSubmitDiscount = async () => {
    try {
      await axiosInstance.put(`/products/${currentId}/discount`, discountData);
      toast.success('Remise appliquée avec succès');
      handleCloseDiscountDialog();
      fetchProducts();
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'application de la remise:", error);
      toast.error("Erreur lors de l'application de la remise");
      return { success: false, error };
    }
  };

  /**
   * Ouvre le dialogue de confirmation de suppression
   * @param {string} id - ID du produit à supprimer
   */
  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, id });
  };

  /**
   * Confirme la suppression d'un produit
   */
  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/products/${confirmDialog.id}`);
      toast.success('Produit supprimé avec succès');
      fetchProducts();
      setConfirmDialog({ open: false, id: null });
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Erreur lors de la suppression du produit');
      setConfirmDialog({ open: false, id: null });
      return { success: false, error };
    }
  };

  /**
   * Ouvre le dialogue de confirmation de suppression de remise
   * @param {string} id - ID du produit
   */
  const handleRemoveDiscountClick = (id) => {
    setConfirmDiscountRemovalDialog({ open: true, id });
  };

  /**
   * Confirme la suppression d'une remise
   */
  const handleConfirmRemoveDiscount = async () => {
    try {
      await axiosInstance.delete(`/products/${confirmDiscountRemovalDialog.id}/discount`);
      toast.success('Remise supprimée avec succès');
      fetchProducts();
      setConfirmDiscountRemovalDialog({ open: false, id: null });
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la remise:', error);
      toast.error('Erreur lors de la suppression de la remise');
      setConfirmDiscountRemovalDialog({ open: false, id: null });
      return { success: false, error };
    }
  };

  /**
   * Gère le changement de page pour la pagination
   * @param {Event} event - Événement de changement de page
   * @param {number} newPage - Nouvelle page
   */
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  /**
   * Enregistre de nouvelles images pour un produit
   * @param {string} productId - ID du produit
   * @param {Array} images - Tableau des images à enregistrer
   */
  const saveProductImages = async (productId, images) => {
    if (images.length > 0 && productId) {
      const formData = new FormData();
      images.forEach(image => {
        formData.append('pictures', image);
      });
      
      try {
        await axiosInstance.put(`/products/${productId}`, formData);
        toast.success('Images mises à jour avec succès');
        return { success: true };
      } catch (error) {
        console.error("Erreur lors de l'ajout d'images:", error);
        toast.error("Erreur lors de l'ajout d'images");
        return { success: false, error };
      }
    }
    return { success: true };
  };

  // Utilisation de useMemo pour calculer les produits paginés
  // Ce calcul sera mis en cache et recalculé uniquement quand products, page ou rowsPerPage changent
  const paginatedProducts = useMemo(() => {
    return products.slice(
      (page - 1) * rowsPerPage,
      page * rowsPerPage
    );
  }, [products, page, rowsPerPage]);

  return {
    // États
    products,
    categories,
    subcategories,
    companies,
    paginatedProducts,
    formData,
    discountData,
    selectedImages,
    imagePreviews,
    loading,
    page,
    totalPages,
    availableSubcategories,
    openDialog,
    openDiscountDialog,
    openImageDialog,
    confirmDialog,
    confirmDiscountRemovalDialog,
    editMode,
    selectedProduct,
    
    // Méthodes
    fetchProducts,
    fetchCategories,
    fetchSubcategories,
    fetchCompanies,
    handleOpenDialog,
    handleOpenDiscountDialog,
    handleOpenImageDialog,
    handleCloseDialog,
    handleCloseDiscountDialog,
    handleCloseImageDialog,
    handleInputChange,
    handleDiscountInputChange,
    handleImageChange,
    handleRemoveImage,
    handleRemoveServerImage,
    handleSubmit,
    handleSubmitDiscount,
    handleDeleteClick,
    handleConfirmDelete,
    handleRemoveDiscountClick,
    handleConfirmRemoveDiscount,
    handleChangePage,
    saveProductImages,
    
    // Setters (pour manipulation directe si nécessaire)
    setFormData,
    setConfirmDialog,
    setConfirmDiscountRemovalDialog,
    setSelectedImages,
    setImagePreviews,
    setSelectedProduct
  };
};

export default useProducts;