import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, CircularProgress, Grid, MenuItem, Chip, Select,
  OutlinedInput, FormControl, InputLabel, Card, CardContent, CardMedia,
  Tooltip, Pagination, FormControlLabel, Switch, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, LocalOffer, Photo, AttachMoney } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axiosInstance from '../../shared/api/axiosConfig';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ImagePreview from '../components/common/ImagePreview';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDiscountDialog, setOpenDiscountDialog] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    features: '',
    oldPrice: '',
    quantite: '0',
    Company_id: '',
    categoriesa_id: [],
    subcategories_id: []
  });
  const [discountData, setDiscountData] = useState({
    discountedPrice: '',
    discountDuration: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [confirmDiscountRemovalDialog, setConfirmDiscountRemovalDialog] = useState({ open: false, id: null });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
    fetchCompanies();
  }, [page]);

  // Mettre à jour les sous-catégories disponibles en fonction des catégories sélectionnées
  useEffect(() => {
    if (formData.categoriesa_id && formData.categoriesa_id.length > 0) {
      const filtered = subcategories.filter(sub => {
        // Add null checks and handle both object and string cases
        const categoryId = sub.categories_id?._id || sub.categories_id;
        return categoryId && formData.categoriesa_id.includes(categoryId);
      });
      setAvailableSubcategories(filtered);
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.categoriesa_id, subcategories]);

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

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast.error('Impossible de charger les catégories');
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await axiosInstance.get('/subcategories');
      setSubcategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error);
      toast.error('Impossible de charger les sous-catégories');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
      toast.error('Impossible de charger les entreprises');
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      // Convertir les tableaux d'objets en tableaux d'IDs pour les sélecteurs
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
        quantite: product.quantite.toString(),
        Company_id: product.Company_id._id || product.Company_id,
        categoriesa_id: categoriesIds,
        subcategories_id: subcategoriesIds
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
        subcategories_id: []
      });
      setSelectedImages([]);
      setImagePreviews([]);
      setEditMode(false);
      setCurrentId(null);
    }
    setOpenDialog(true);
  };

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

  const handleOpenImageDialog = (product) => {
    setSelectedProduct(product);
    setImagePreviews(product.pictures || []);
    setOpenImageDialog(true);
  };

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
      subcategories_id: []
    });
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleCloseDiscountDialog = () => {
    setOpenDiscountDialog(false);
    setDiscountData({
      discountedPrice: '',
      discountDuration: ''
    });
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
    setSelectedProduct(null);
    setSelectedImages([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDiscountInputChange = (e) => {
    const { name, value } = e.target;
    setDiscountData({ ...discountData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages([...selectedImages, ...filesArray]);
      
      const newImagePreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newImagePreviews]);
    }
  };

  const handleRemoveImage = (index) => {
    const newSelectedImages = [...selectedImages];
    newSelectedImages.splice(index, 1);
    setSelectedImages(newSelectedImages);

    const newImagePreviews = [...imagePreviews];
    newImagePreviews.splice(index, 1);
    setImagePreviews(newImagePreviews);
  };

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
      console.error('Erreur lors de la suppression de l\'image:', error);
      toast.error('Erreur lors de la suppression de l\'image');
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('features', formData.features);
      formDataToSend.append('oldPrice', formData.oldPrice);
      formDataToSend.append('quantite', formData.quantite);
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

      if (editMode) {
        await axiosInstance.put(`/products/${currentId}`, formDataToSend);
        toast.success('Produit mis à jour avec succès');
      } else {
        await axiosInstance.post('/products', formDataToSend);
        toast.success('Produit créé avec succès');
      }

      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du produit:', error);
      toast.error('Erreur lors de l\'enregistrement du produit');
    }
  };

  const handleSubmitDiscount = async () => {
    try {
      await axiosInstance.put(`/products/${currentId}/discount`, discountData);
      toast.success('Remise appliquée avec succès');
      handleCloseDiscountDialog();
      fetchProducts();
    } catch (error) {
      console.error('Erreur lors de l\'application de la remise:', error);
      toast.error('Erreur lors de l\'application de la remise');
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/products/${confirmDialog.id}`);
      toast.success('Produit supprimé avec succès');
      fetchProducts();
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Erreur lors de la suppression du produit');
    } finally {
      setConfirmDialog({ open: false, id: null });
    }
  };

  const handleRemoveDiscountClick = (id) => {
    setConfirmDiscountRemovalDialog({ open: true, id });
  };

  const handleConfirmRemoveDiscount = async () => {
    try {
      await axiosInstance.delete(`/products/${confirmDiscountRemovalDialog.id}/discount`);
      toast.success('Remise supprimée avec succès');
      fetchProducts();
    } catch (error) {
      console.error('Erreur lors de la suppression de la remise:', error);
      toast.error('Erreur lors de la suppression de la remise');
    } finally {
      setConfirmDiscountRemovalDialog({ open: false, id: null });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Pagination des produits
  const paginatedProducts = products.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des Produits</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Ajouter un produit
        </Button>
      </Box>

      <Grid container spacing={3}>
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={product.mainPicture || '/placeholder-image.jpg'}
                  alt={product.nom}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.description?.substring(0, 100)}
                    {product.description?.length > 100 ? '...' : ''}
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Prix:</strong> {product.oldPrice} €
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Stock:</strong> {product.quantite}
                      </Typography>
                    </Grid>
                    {product.discountedPrice && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="error">
                          <strong>Prix réduit:</strong> {product.discountedPrice} €
                          {product.discountDuration && (
                            <span> (jusqu'au {format(new Date(product.discountDuration), 'dd/MM/yyyy')})</span>
                          )}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Entreprise:</strong> {product.Company_id?.nom || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {product.categoriesa_id?.map((category) => (
                          <Chip
                            key={category?._id || 'temp'}
                            label={category?.name || 'N/A'}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Tooltip title="Modifier">
                      <IconButton onClick={() => handleOpenDialog(product)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton onClick={() => handleDeleteClick(product._id)}>
                        <Delete color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box>
                    <Tooltip title="Gérer les images">
                      <IconButton onClick={() => handleOpenImageDialog(product)}>
                        <Photo color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={product.discountedPrice ? "Modifier la remise" : "Ajouter une remise"}>
                      <IconButton onClick={() => handleOpenDiscountDialog(product)}>
                        <LocalOffer color={product.discountedPrice ? "error" : "action"} />
                      </IconButton>
                    </Tooltip>
                    {product.discountedPrice && (
                      <Tooltip title="Supprimer la remise">
                        <IconButton onClick={() => handleRemoveDiscountClick(product._id)}>
                          <AttachMoney color="error" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>Aucun produit trouvé</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>

      {/* Dialogue d'ajout/modification de produit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Modifier le produit' : 'Ajouter un produit'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nom"
                label="Nom du produit"
                fullWidth
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="company-label">Entreprise</InputLabel>
                <Select
                  labelId="company-label"
                  name="Company_id"
                  value={formData.Company_id}
                  onChange={handleInputChange}
                  required
                >
                  {companies.map((company) => (
                    <MenuItem key={company._id} value={company._id}>
                      {company.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="oldPrice"
                label="Prix (€)"
                fullWidth
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                value={formData.oldPrice}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="quantite"
                label="Quantité en stock"
                fullWidth
                type="number"
                value={formData.quantite}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="features"
                label="Caractéristiques"
                fullWidth
                multiline
                rows={2}
                value={formData.features}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="categories-label">Catégories</InputLabel>
                <Select
                  labelId="categories-label"
                  multiple
                  name="categoriesa_id"
                  value={formData.categoriesa_id}
                  onChange={handleInputChange}
                  input={<OutlinedInput label="Catégories" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const category = categories.find(cat => cat._id === value);
                        return category ? (
                          <Chip key={value} label={category.name} />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="subcategories-label">Sous-catégories</InputLabel>
                <Select
                  labelId="subcategories-label"
                  multiple
                  name="subcategories_id"
                  value={formData.subcategories_id}
                  onChange={handleInputChange}
                  input={<OutlinedInput label="Sous-catégories" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const subcategory = subcategories.find(sub => sub._id === value);
                        return subcategory ? (
                          <Chip key={value} label={subcategory.name} />
                        ) : null;
                      })}
                    </Box>
                  )}
                  disabled={formData.categoriesa_id.length === 0}
                >
                  {availableSubcategories.map((subcategory) => (
                    <MenuItem key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="images-upload"
                type="file"
                multiple
                onChange={handleImageChange}
              />
              <label htmlFor="images-upload">
                <Button variant="outlined" component="span">
                  {editMode ? 'Ajouter des images' : 'Uploader des images'}
                </Button>
              </label>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap' }}>
                {imagePreviews.map((src, index) => (
                  <ImagePreview
                    key={index}
                    src={src}
                    alt={`Preview ${index}`}
                    onDelete={() => handleRemoveImage(index)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.nom || !formData.oldPrice || !formData.Company_id || formData.categoriesa_id.length === 0}
          >
            {editMode ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de remise */}
      <Dialog open={openDiscountDialog} onClose={handleCloseDiscountDialog}>
        <DialogTitle>Gérer la remise</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="discountedPrice"
                label="Prix remisé (€)"
                fullWidth
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                value={discountData.discountedPrice}
                onChange={handleDiscountInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="discountDuration"
                label="Valable jusqu'au"
                type="date"
                fullWidth
                value={discountData.discountDuration}
                onChange={handleDiscountInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDiscountDialog}>Annuler</Button>
          <Button
            onClick={handleSubmitDiscount}
            variant="contained"
            disabled={!discountData.discountedPrice}
          >
            Appliquer la remise
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de gestion des images */}
      <Dialog open={openImageDialog} onClose={handleCloseImageDialog} maxWidth="md">
        <DialogTitle>Gérer les images du produit</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Images actuelles
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedProduct && selectedProduct.pictures && selectedProduct.pictures.length > 0 ? (
                  selectedProduct.pictures.map((src, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: 150,
                        height: 150,
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        overflow: 'hidden',
                        mb: 2,
                      }}
                    >
                      <img
                        src={src}
                        alt={`Image ${index}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          bgcolor: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                          },
                        }}
                        onClick={() => handleRemoveServerImage(selectedProduct._id, index)}
                      >
                        <Delete color="error" />
                      </IconButton>
                      {src === selectedProduct.mainPicture && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'primary.main',
                            color: 'white',
                            textAlign: 'center',
                            py: 0.5,
                          }}
                        >
                          <Typography variant="caption">Principale</Typography>
                        </Box>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2">Aucune image disponible</Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Ajouter de nouvelles images
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="add-more-images"
                type="file"
                multiple
                onChange={handleImageChange}
              />
              <label htmlFor="add-more-images">
                <Button variant="contained" component="span">
                  Sélectionner des images
                </Button>
              </label>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedImages.map((file, index) => (
                  <ImagePreview
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`Nouvelle image ${index}`}
                    onDelete={() => {
                      const newImages = [...selectedImages];
                      newImages.splice(index, 1);
                      setSelectedImages(newImages);
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>Annuler</Button>
          <Button
            onClick={async () => {
              if (selectedImages.length > 0 && selectedProduct) {
                const formData = new FormData();
                selectedImages.forEach(image => {
                  formData.append('pictures', image);
                });
                
                try {
                  await axiosInstance.put(`/products/${selectedProduct._id}`, formData);
                  toast.success('Images mises à jour avec succès');
                  handleCloseImageDialog();
                  fetchProducts();
                } catch (error) {
                  console.error('Erreur lors de l\'ajout d\'images:', error);
                  toast.error('Erreur lors de l\'ajout d\'images');
                }
              } else {
                handleCloseImageDialog();
              }
            }}
            variant="contained"
            disabled={selectedImages.length === 0}
          >
            Enregistrer les nouvelles images
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce produit? Cette action est irréversible."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />

      {/* Dialogue de confirmation de suppression de remise */}
      <ConfirmDialog
        open={confirmDiscountRemovalDialog.open}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette remise?"
        onConfirm={handleConfirmRemoveDiscount}
        onCancel={() => setConfirmDiscountRemovalDialog({ open: false, id: null })}
      />
    </div>
  );
}

export default Products;