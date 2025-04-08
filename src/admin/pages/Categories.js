import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, CircularProgress, Grid
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axiosInstance from '../../shared/api/axiosConfig';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ImagePreview from '../components/common/ImagePreview';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/categories');
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast.error('Impossible de charger les catégories');
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setFormData({ name: category.name, description: category.description || '' });
      setImagePreview(category.logo || '');
      setEditMode(true);
      setCurrentId(category._id);
    } else {
      setFormData({ name: '', description: '' });
      setSelectedImage(null);
      setImagePreview('');
      setEditMode(false);
      setCurrentId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', description: '' });
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
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      if (selectedImage) {
        formDataToSend.append('logo', selectedImage);
      }

      if (editMode) {
        await axiosInstance.put(`/categories/${currentId}`, formDataToSend);
        toast.success('Catégorie mise à jour avec succès');
      } else {
        await axiosInstance.post('/categories', formDataToSend);
        toast.success('Catégorie créée avec succès');
      }

      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la catégorie:', error);
      toast.error('Erreur lors de l\'enregistrement de la catégorie');
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/categories/${confirmDialog.id}`);
      toast.success('Catégorie supprimée avec succès');
      fetchCategories();
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      toast.error('Erreur lors de la suppression de la catégorie');
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
        <Typography variant="h4">Gestion des Catégories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Ajouter une catégorie
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <Box sx={{ width: 60, height: 60 }}>
                      {category.logo ? (
                        <img
                          src={category.logo}
                          alt={category.name}
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
                          <Typography variant="caption">No image</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(category)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(category._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucune catégorie trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue d'ajout/modification */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editMode ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nom"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
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
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="logo-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="logo-upload">
                <Button variant="outlined" component="span">
                  {editMode ? 'Changer l\'image' : 'Ajouter une image'}
                </Button>
              </label>
              <Box sx={{ mt: 2 }}>
                {imagePreview && (
                  <ImagePreview
                    src={imagePreview}
                    alt="Aperçu de l'image"
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
            disabled={!formData.name}
          >
            {editMode ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette catégorie? Cette action est irréversible."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />
    </div>
  );
}

export default Categories;