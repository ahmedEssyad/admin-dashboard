import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosConfig';

const VariationsManager = ({ productId, onVariationsChange, existingVariations = [], availableAttributes = { colors: [], sizes: [] } }) => {
  const [variations, setVariations] = useState(existingVariations || []);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVariation, setCurrentVariation] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // États pour le formulaire de variation
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  
  // États pour les attributs disponibles
  const [colors, setColors] = useState(availableAttributes.colors || []);
  const [sizes, setSizes] = useState(availableAttributes.sizes || []);
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  
  // État pour gérer les images
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  
  useEffect(() => {
    // Mettre à jour les variations lorsque les props changent
    setVariations(existingVariations || []);
  }, [existingVariations]);
  
  useEffect(() => {
    // Mettre à jour les attributs disponibles lorsque les props changent
    setColors(availableAttributes.colors || []);
    setSizes(availableAttributes.sizes || []);
  }, [availableAttributes]);
  
  const handleOpenDialog = (variation = null) => {
    if (variation) {
      // Mode édition
      setEditMode(true);
      setCurrentVariation(variation);
      setColor(variation.attributes?.color || '');
      setSize(variation.attributes?.size || '');
      setQuantity(variation.quantite || 0);
      setPrice(variation.price || '');
      setSku(variation.sku || '');
      // Réinitialiser les fichiers sélectionnés
      setSelectedFiles([]);
      setImagePreview(variation.mainPicture || null);
    } else {
      // Mode création
      setEditMode(false);
      setCurrentVariation(null);
      setColor('');
      setSize('');
      setQuantity(0);
      setPrice('');
      setSku(generateSku());
      setSelectedFiles([]);
      setImagePreview(null);
    }
    
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };
  
  const resetForm = () => {
    setColor('');
    setSize('');
    setQuantity(0);
    setPrice('');
    setSku('');
    setSelectedFiles([]);
    setImagePreview(null);
  };
  
  const generateSku = () => {
    // Génération d'un SKU aléatoire
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  const handleAddColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors(prev => [...prev, newColor]);
      setNewColor('');
    }
  };
  
  const handleAddSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes(prev => [...prev, newSize]);
      setNewSize('');
    }
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Afficher un aperçu du premier fichier
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };
  
  const saveVariation = async () => {
    // Vérification de base
    if (!color && !size) {
      toast.error('Veuillez spécifier au moins une couleur ou une taille.');
      return;
    }
    
    if (quantity < 0) {
      toast.error('La quantité ne peut pas être négative.');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('color', color);
      formData.append('size', size);
      formData.append('quantite', quantity);
      if (price) formData.append('price', price);
      formData.append('sku', sku);
      
      // Ajouter les fichiers s'ils existent
      if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          formData.append('pictures', file);
        });
      }
      
      let response;
      
      if (editMode && currentVariation) {
        // Mise à jour d'une variation existante
        response = await axiosInstance.put(
          `/products/${productId}/variations/${currentVariation._id}`, 
          formData
        );
      } else {
        // Création d'une nouvelle variation
        response = await axiosInstance.post(
          `/products/${productId}/variations`, 
          formData
        );
      }
      
      if (response.data && response.data.product) {
        // Mettre à jour les variations dans le composant parent
        if (onVariationsChange) {
          onVariationsChange(response.data.product.variations);
        }
        
        // Mettre à jour l'état local
        setVariations(response.data.product.variations);
        
        // Afficher un message de succès
        toast.success(editMode 
          ? 'Variation mise à jour avec succès.' 
          : 'Variation ajoutée avec succès.'
        );
        
        // Fermer le dialogue
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la variation:', error);
      toast.error('Erreur lors de l\'enregistrement de la variation.');
    }
  };
  
  const deleteVariation = async (variationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette variation ?')) {
      return;
    }
    
    try {
      const response = await axiosInstance.delete(
        `/products/${productId}/variations/${variationId}`
      );
      
      if (response.data && response.data.product) {
        // Mettre à jour les variations dans le composant parent
        if (onVariationsChange) {
          onVariationsChange(response.data.product.variations);
        }
        
        // Mettre à jour l'état local
        setVariations(response.data.product.variations);
        
        // Afficher un message de succès
        toast.success('Variation supprimée avec succès.');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la variation:', error);
      toast.error('Erreur lors de la suppression de la variation.');
    }
  };
  
  // Format du prix avec le symbole de la devise
  const formatPrice = (price) => {
    if (!price) return '—';
    return `${price.toLocaleString()} MRU`;
  };
  
  return (
    <Box sx={{ mt: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Variations du produit
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Ajouter une variation
            </Button>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Attributs disponibles
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  <strong>Couleurs:</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {colors.length > 0 ? (
                    colors.map(color => (
                      <Chip 
                        key={color} 
                        label={color} 
                        size="small"
                        style={{ 
                          backgroundColor: color.toLowerCase(),
                          color: isLightColor(color.toLowerCase()) ? '#000' : '#fff',
                          margin: '2px'
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucune couleur définie. Ajoutez des couleurs en créant des variations.
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  <strong>Tailles:</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {sizes.length > 0 ? (
                    sizes.map(size => (
                      <Chip 
                        key={size} 
                        label={size} 
                        size="small"
                        style={{ margin: '2px' }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucune taille définie. Ajoutez des tailles en créant des variations.
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          {variations.length === 0 ? (
            <Alert severity="info">
              Ce produit n'a pas encore de variations. Ajoutez-en une pour commencer.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Couleur</TableCell>
                    <TableCell>Taille</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Prix</TableCell>
                    <TableCell align="right">Quantité</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variations.map((variation) => (
                    <TableRow key={variation._id}>
                      <TableCell>
                        {variation.mainPicture ? (
                          <Box
                            component="img"
                            src={variation.mainPicture}
                            alt={`Variation ${variation._id}`}
                            sx={{ width: 50, height: 50, objectFit: 'cover' }}
                          />
                        ) : (
                          <Box sx={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon color="disabled" />
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {variation.attributes?.color ? (
                          <Chip 
                            label={variation.attributes.color} 
                            size="small"
                            style={{ 
                              backgroundColor: variation.attributes.color.toLowerCase(),
                              color: isLightColor(variation.attributes.color.toLowerCase()) ? '#000' : '#fff'
                            }}
                          />
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        {variation.attributes?.size || '—'}
                      </TableCell>
                      <TableCell>{variation.sku}</TableCell>
                      <TableCell align="right">
                        {variation.price ? formatPrice(variation.price) : '—'}
                      </TableCell>
                      <TableCell align="right">{variation.quantite}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenDialog(variation)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => deleteVariation(variation._id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      
      {/* Dialogue d'ajout/édition de variation */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Modifier la variation' : 'Ajouter une variation'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Attributs de la variation
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="color-label">Couleur</InputLabel>
                    <Select
                      labelId="color-label"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      label="Couleur"
                    >
                      <MenuItem value="">
                        <em>Aucune</em>
                      </MenuItem>
                      {colors.map((c) => (
                        <MenuItem key={c} value={c}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                marginRight: 1, 
                                backgroundColor: c.toLowerCase(),
                                border: '1px solid #ddd' 
                              }} 
                            />
                            {c}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      label="Nouvelle couleur"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      size="small"
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Button 
                      variant="outlined" 
                      onClick={handleAddColor}
                      size="small"
                    >
                      Ajouter
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="size-label">Taille</InputLabel>
                    <Select
                      labelId="size-label"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      label="Taille"
                    >
                      <MenuItem value="">
                        <em>Aucune</em>
                      </MenuItem>
                      {sizes.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      label="Nouvelle taille"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      size="small"
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Button 
                      variant="outlined" 
                      onClick={handleAddSize}
                      size="small"
                    >
                      Ajouter
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Informations de stock
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Quantité en stock"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    type="number"
                    fullWidth
                    margin="normal"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Prix spécifique (optionnel)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                    fullWidth
                    margin="normal"
                    helperText="Laissez vide pour utiliser le prix du produit"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="SKU"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Images de la variation
              </Typography>
              
              <Box 
                sx={{ 
                  border: '2px dashed #ccc',
                  borderRadius: 1,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200,
                  mb: 2
                }}
              >
                {imagePreview ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Aperçu"
                      sx={{ maxWidth: '100%', maxHeight: 200, mb: 2 }}
                    />
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ mt: 1 }}
                    >
                      Changer l'image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                        multiple
                      />
                    </Button>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                  >
                    Ajouter des images
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                      multiple
                    />
                  </Button>
                )}
              </Box>
              
              <Typography variant="body2" color="textSecondary">
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} fichier(s) sélectionné(s)` 
                  : 'Aucun fichier sélectionné'}
              </Typography>
              
              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Fichiers à télécharger :
                  </Typography>
                  <ul>
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={saveVariation} variant="contained" color="primary">
            {editMode ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Fonction utilitaire pour déterminer si une couleur est claire ou sombre
const isLightColor = (color) => {
  // Couleurs basiques
  const lightColors = ['white', 'ivory', 'lightyellow', 'yellow', 'lightgreen', 'lightblue', 'lavender', 'pink'];
  if (lightColors.includes(color)) return true;
  
  // Si hexadécimal
  if (color.startsWith('#')) {
    const hex = color.substring(1);
    const rgb = parseInt(hex, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    // Calculer la luminosité
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }
  
  return false;
};

export default VariationsManager;