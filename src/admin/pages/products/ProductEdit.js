import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  InputAdornment,
  Alert
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosConfig';
import PageHeader from '../../components/common/PageHeader';
import ProductTypeSelector from '../../components/products/ProductTypeSelector';
import VariationsManager from '../../components/products/VariationsManager';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewProduct = !id || id === 'new' || id === 'undefined';
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  
  // États pour le formulaire
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
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Charger les données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Charger les catégories, sous-catégories et entreprises
        const [categoriesRes, subcategoriesRes, companiesRes] = await Promise.all([
          axiosInstance.get('/categories'),
          axiosInstance.get('/subcategories'),
          axiosInstance.get('/companies')
        ]);
        
        setCategories(categoriesRes.data);
        setSubcategories(subcategoriesRes.data);
        setCompanies(companiesRes.data);
        
        // Si on modifie un produit existant, le charger
        // Ne faire la requête que si l'ID est valide (pas 'new' ou undefined)
        if (!isNewProduct && id && id !== 'undefined') {
          try {
            const productRes = await axiosInstance.get(`/products/${id}`);
            setProduct(productRes.data);
            
            // Préparer les données du formulaire
            const productData = productRes.data;
            
            // Convertir les tableaux d'objets en tableaux d'IDs pour les sélecteurs
            const categoriesIds = productData.categoriesa_id.map(cat => 
              typeof cat === 'object' ? cat._id : cat
            );
            const subcategoriesIds = productData.subcategories_id.map(sub => 
              typeof sub === 'object' ? sub._id : sub
            );
            
            setFormData({
              nom: productData.nom,
              description: productData.description || '',
              features: productData.features || '',
              oldPrice: productData.oldPrice.toString(),
              quantite: (productData.quantite !== undefined && productData.quantite !== null) ? productData.quantite.toString() : '0',
              Company_id: productData.Company_id._id || productData.Company_id,
              categoriesa_id: categoriesIds,
              subcategories_id: subcategoriesIds,
              productType: productData.productType || 'simple'
            });
            
            setImagePreviews(productData.pictures || []);
          } catch (productError) {
            console.error('Erreur lors du chargement du produit:', productError);
            toast.error(`Impossible de charger le produit: ${productError.response?.data?.message || productError.message}`);
            // Rediriger vers la page des produits en cas d'erreur
            navigate('/admin/products');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [id, isNewProduct, navigate]);
  
  // Mettre à jour les sous-catégories disponibles en fonction des catégories sélectionnées
  useEffect(() => {
    if (formData.categoriesa_id && formData.categoriesa_id.length > 0) {
      const filtered = subcategories.filter(sub => {
        const categoryId = sub.categories_id?._id || sub.categories_id;
        return categoryId && formData.categoriesa_id.includes(categoryId);
      });
      setAvailableSubcategories(filtered);
      
      // Filtrer les sous-catégories qui ne sont plus valides
      const validSubcategories = formData.subcategories_id.filter(subId => 
        filtered.some(sub => sub._id === subId)
      );
      
      if (validSubcategories.length !== formData.subcategories_id.length) {
        setFormData(prev => ({
          ...prev,
          subcategories_id: validSubcategories
        }));
      }
    } else {
      setAvailableSubcategories([]);
      // Réinitialiser les sous-catégories si aucune catégorie n'est sélectionnée
      if (formData.subcategories_id.length > 0) {
        setFormData(prev => ({
          ...prev,
          subcategories_id: []
        }));
      }
    }
  }, [formData.categoriesa_id, subcategories]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    
    // Ne supprimer que les aperçus correspondant aux images sélectionnées,
    // pas les images déjà enregistrées
    if (index < selectedImages.length) {
      const newImagePreviews = [...imagePreviews];
      newImagePreviews.splice(index, 1);
      setImagePreviews(newImagePreviews);
    }
  };
  
  const handleProductTypeChange = (newType, updatedProduct) => {
    setFormData(prev => ({ ...prev, productType: newType }));
    
    if (updatedProduct) {
      setProduct(updatedProduct);
      
      // Mettre à jour la quantité si le type est passé de variable à simple
      if (newType === 'simple' && updatedProduct.quantite) {
        setFormData(prev => ({
          ...prev,
          quantite: updatedProduct.quantite.toString()
        }));
      }
    }
  };
  
  const handleVariationsChange = (newVariations) => {
    if (product) {
      setProduct(prev => ({
        ...prev,
        variations: newVariations
      }));
    }
  };
  
  const handleSubmit = async () => {
    if (!formData.nom || !formData.oldPrice || !formData.Company_id || formData.categoriesa_id.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      setSaving(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('features', formData.features);
      formDataToSend.append('oldPrice', formData.oldPrice);
      formDataToSend.append('productType', formData.productType);
      
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
      
      // Mettre à jour ou créer le produit
      let response;
      if (isNewProduct) {
        response = await axiosInstance.post('/products', formDataToSend);
        toast.success('Produit créé avec succès');
      } else {
        response = await axiosInstance.put(`/products/${id}`, formDataToSend);
        toast.success('Produit mis à jour avec succès');
      }
      
      // Rediriger vers la page de tous les produits ou, si c'est un nouveau produit,
      // vers la page d'édition de ce produit
      if (isNewProduct && response.data?.product?._id) {
        navigate(`/admin/products/edit/${response.data.product._id}`);
      } else {
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du produit:', error);
      toast.error('Erreur lors de l\'enregistrement du produit');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <PageHeader 
        title={isNewProduct ? "Nouveau produit" : "Modifier le produit"} 
        subtitle={isNewProduct ? "Ajouter un nouveau produit" : `Édition du produit: ${formData.nom}`}
        action={
          <Button
            startIcon={<ArrowBack />}
            variant="outlined"
            onClick={() => navigate('/admin/products')}
          >
            Retour
          </Button>
        }
      />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="nom"
                    label="Nom du produit *"
                    fullWidth
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="company-label">Entreprise *</InputLabel>
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
                    label="Prix (MRU) *"
                    fullWidth
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">MRU</InputAdornment>,
                    }}
                    value={formData.oldPrice}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                  />
                </Grid>
                {formData.productType === 'simple' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="quantite"
                      label="Quantité en stock *"
                      fullWidth
                      type="number"
                      value={formData.quantite}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    margin="normal"
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
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="categories-label">Catégories *</InputLabel>
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
                  <FormControl fullWidth margin="normal">
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
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Images du produit
              </Typography>
              
              <Box sx={{ my: 2 }}>
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
                    Ajouter des images
                  </Button>
                </label>
              </Box>
              
              {imagePreviews.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {imagePreviews.map((src, index) => (
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
                      {/* Afficher une indication pour l'image principale */}
                      {product && src === product.mainPicture && (
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
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  Aucune image n'a été ajoutée. Ajoutez au moins une image pour le produit.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              {isNewProduct ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Type de produit
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel id="product-type-label">Type de produit</InputLabel>
                      <Select
                        labelId="product-type-label"
                        name="productType"
                        value={formData.productType}
                        onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
                      >
                        <MenuItem value="simple">Produit simple</MenuItem>
                        <MenuItem value="variable">Produit variable (avec couleurs, tailles, etc.)</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {formData.productType === 'simple' ? 
                        "Un produit simple est un produit unique avec un seul prix et une seule quantité en stock." :
                        "Un produit variable vous permet de définir des variations (couleurs, tailles, etc.) avec des stocks et prix spécifiques."
                      }
                    </Typography>
                  </Box>
                </>
              ) : (
                <ProductTypeSelector 
                  productId={id}
                  productType={formData.productType}
                  onProductTypeChange={handleProductTypeChange}
                />
              )}
              
              <Divider sx={{ my: 3 }} />
              
              {formData.productType === 'variable' && !isNewProduct && (
                <VariationsManager
                  productId={id}
                  existingVariations={product?.variations || []}
                  availableAttributes={product?.availableAttributes || { colors: [], sizes: [] }}
                  onVariationsChange={handleVariationsChange}
                />
              )}
              
              {formData.productType === 'variable' && isNewProduct && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Vous avez choisi de créer un produit variable. Les options de variations seront disponibles après l'enregistrement du produit.
                  </Alert>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Comment fonctionnent les produits variables ?
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    Un produit variable permet de gérer plusieurs versions d'un même produit avec des attributs différents comme :
                  </Typography>
                  
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Typography component="li" variant="body2">
                      Des couleurs différentes (rouge, bleu, vert, etc.)
                    </Typography>
                    <Typography component="li" variant="body2">
                      Des tailles différentes (S, M, L, XL, etc.)
                    </Typography>
                    <Typography component="li" variant="body2">
                      Des quantités en stock spécifiques à chaque variation
                    </Typography>
                    <Typography component="li" variant="body2">
                      Des prix spécifiques (optionnel) pour certaines variations
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                    Après avoir enregistré ce produit, vous pourrez :
                  </Typography>
                  
                  <Box component="ol" sx={{ pl: 2 }}>
                    <Typography component="li" variant="body2">
                      Ajouter des attributs disponibles (couleurs, tailles)
                    </Typography>
                    <Typography component="li" variant="body2">
                      Créer des variations spécifiques avec ces attributs
                    </Typography>
                    <Typography component="li" variant="body2">
                      Définir le stock pour chaque variation
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              startIcon={<ArrowBack />}
              sx={{ mr: 2 }}
              onClick={() => navigate('/admin/products')}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSubmit}
              disabled={
                saving || 
                !formData.nom || 
                !formData.oldPrice || 
                !formData.Company_id || 
                formData.categoriesa_id.length === 0 ||
                (formData.productType === 'simple' && !formData.quantite)
              }
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductEdit;