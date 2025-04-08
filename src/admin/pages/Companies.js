import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, CircularProgress, Grid, MenuItem, Chip, Select,
  OutlinedInput, FormControl, InputLabel
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axiosInstance from '../../shared/api/axiosConfig';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ImagePreview from '../components/common/ImagePreview';

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    categories_id: [],
    subcategories_id: []
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  useEffect(() => {
    fetchCompanies();
    fetchCategories();
    fetchSubcategories();
  }, []);

  // Mettre à jour les sous-catégories disponibles en fonction des catégories sélectionnées
  useEffect(() => {
    if (formData.categories_id && formData.categories_id.length > 0) {
      const filtered = subcategories.filter(sub => {
        // Handle both cases where categories_id might be an object or string
        if (!sub || !sub.categories_id) return false;
        
        const categoryId = typeof sub.categories_id === 'object' 
          ? sub.categories_id?._id 
          : sub.categories_id;
          
        return categoryId && formData.categories_id.includes(categoryId);
      });
      setAvailableSubcategories(filtered);
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.categories_id, subcategories]);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/companies');
      setCompanies(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
      toast.error('Impossible de charger les entreprises');
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

  const handleOpenDialog = (company = null) => {
    if (company) {
      // Convertir les tableaux d'objets en tableaux d'IDs pour les sélecteurs
      const categoriesIds = company.categories_id.map(cat => 
        typeof cat === 'object' ? cat._id : cat
      );
      const subcategoriesIds = company.subcategories_id.map(sub => 
        typeof sub === 'object' ? sub._id : sub
      );

      setFormData({
        nom: company.nom,
        categories_id: categoriesIds,
        subcategories_id: subcategoriesIds
      });
      setImagePreview(company.logo || '');
      setEditMode(true);
      setCurrentId(company._id);
    } else {
      setFormData({
        nom: '',
        categories_id: [],
        subcategories_id: []
      });
      setSelectedImage(null);
      setImagePreview('');
      setEditMode(false);
      setCurrentId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      nom: '',
      categories_id: [],
      subcategories_id: []
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);
      
      // Ajouter les catégories et sous-catégories
      formData.categories_id.forEach(catId => {
        formDataToSend.append('categories_id', catId);
      });
      
      formData.subcategories_id.forEach(subId => {
        formDataToSend.append('subcategories_id', subId);
      });
      
      // Ajouter l'image si disponible
      if (selectedImage) {
        formDataToSend.append('logo', selectedImage);
      }

      if (editMode) {
        await axiosInstance.put(`/companies/${currentId}`, formDataToSend);
        toast.success('Entreprise mise à jour avec succès');
      } else {
        await axiosInstance.post('/companies', formDataToSend);
        toast.success('Entreprise créée avec succès');
      }

      handleCloseDialog();
      fetchCompanies();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'entreprise:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'entreprise');
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/companies/${confirmDialog.id}`);
      toast.success('Entreprise supprimée avec succès');
      fetchCompanies();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entreprise:', error);
      toast.error('Erreur lors de la suppression de l\'entreprise');
    } finally {
      setConfirmDialog({ open: false, id: null });
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
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des Entreprises</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Ajouter une entreprise
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Logo</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Catégories</TableCell>
              <TableCell>Sous-catégories</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.length > 0 ? (
              companies.map((company) => (
                <TableRow key={company._id}>
                  <TableCell>
                    <Box sx={{ width: 60, height: 60 }}>
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.nom}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: 'grey.200',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                          }}
                        >
                          <Typography variant="caption">No logo</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{company.nom}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {company.categories_id.map((category) => (
                        <Chip
                          key={category._id}
                          label={category.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {company.subcategories_id.map((subcategory) => (
                        <Chip
                          key={subcategory._id}
                          label={subcategory.name}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(company)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(company._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Aucune entreprise trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue d'ajout/modification */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Modifier l\'entreprise' : 'Ajouter une entreprise'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="nom"
                label="Nom de l'entreprise"
                fullWidth
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="categories-label">Catégories</InputLabel>
                <Select
                  labelId="categories-label"
                  multiple
                  name="categories_id"
                  value={formData.categories_id}
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
                  disabled={formData.categories_id.length === 0}
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
                id="logo-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="logo-upload">
                <Button variant="outlined" component="span">
                  {editMode ? 'Changer le logo' : 'Ajouter un logo'}
                </Button>
              </label>
              <Box sx={{ mt: 2 }}>
                {imagePreview && (
                  <ImagePreview
                    src={imagePreview}
                    alt="Aperçu du logo"
                    onDelete={() => {
                      setSelectedImage(null);
                      setImagePreview('');
                    }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.nom || formData.categories_id.length === 0}
          >
            {editMode ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette entreprise? Cette action est irréversible."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />
    </div>
  );
}

export default Companies;