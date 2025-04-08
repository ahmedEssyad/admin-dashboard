import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, CircularProgress, Grid, MenuItem
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axiosInstance from '../../shared/api/axiosConfig';

import ConfirmDialog from '../components/common/ConfirmDialog';

function Subcategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', categories_id: '' });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const response = await axiosInstance.get('/subcategories');
      setSubcategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error);
      toast.error('Impossible de charger les sous-catégories');
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

  const handleOpenDialog = (subcategory = null) => {
    if (subcategory) {
      setFormData({
        name: subcategory.name,
        categories_id: subcategory.categories_id._id || subcategory.categories_id
      });
      setEditMode(true);
      setCurrentId(subcategory._id);
    } else {
      setFormData({ name: '', categories_id: '' });
      setEditMode(false);
      setCurrentId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', categories_id: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await axiosInstance.put(`/subcategories/${currentId}`, formData);
        toast.success('Sous-catégorie mise à jour avec succès');
      } else {
        await axiosInstance.post('/subcategories', formData);
        toast.success('Sous-catégorie créée avec succès');
      }

      handleCloseDialog();
      fetchSubcategories();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la sous-catégorie:', error);
      toast.error('Erreur lors de l\'enregistrement de la sous-catégorie');
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/subcategories/${confirmDialog.id}`);
      toast.success('Sous-catégorie supprimée avec succès');
      fetchSubcategories();
    } catch (error) {
      console.error('Erreur lors de la suppression de la sous-catégorie:', error);
      toast.error('Erreur lors de la suppression de la sous-catégorie');
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
        <Typography variant="h4">Gestion des Sous-catégories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Ajouter une sous-catégorie
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Catégorie Parente</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subcategories.length > 0 ? (
              subcategories.map((subcategory) => (
                <TableRow key={subcategory._id}>
                  <TableCell>{subcategory.name}</TableCell>
                  <TableCell>
                    {subcategory.categories_id && subcategory.categories_id.name
                      ? subcategory.categories_id.name
                      : 'Non spécifié'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(subcategory)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(subcategory._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Aucune sous-catégorie trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue d'ajout/modification */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editMode ? 'Modifier la sous-catégorie' : 'Ajouter une sous-catégorie'}
        </DialogTitle>
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
                select
                name="categories_id"
                label="Catégorie parente"
                fullWidth
                value={formData.categories_id}
                onChange={handleInputChange}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.categories_id}
          >
            {editMode ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette sous-catégorie? Cette action est irréversible."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />
    </div>
  );
}

export default Subcategories;