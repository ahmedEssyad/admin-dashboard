import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, FormControl, InputLabel, Select, MenuItem, Grid,
  OutlinedInput, Box, Chip, InputAdornment, Typography, Alert
} from '@mui/material';
import ImagePreview from '../common/ImagePreview';

/**
 * Dialogue d'ajout/modification de produit
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.open - Indique si le dialogue est ouvert
 * @param {Function} props.onClose - Fonction appelée à la fermeture du dialogue
 * @param {Object} props.formData - Données du formulaire
 * @param {Function} props.onChange - Fonction appelée lors du changement des champs
 * @param {Function} props.onSubmit - Fonction appelée lors de la soumission du formulaire
 * @param {Array} props.categories - Liste des catégories disponibles
 * @param {Array} props.companies - Liste des entreprises disponibles
 * @param {Array} props.availableSubcategories - Liste des sous-catégories disponibles pour les catégories sélectionnées
 * @param {Array} props.imagePreviews - Aperçus des images sélectionnées
 * @param {Function} props.onImageChange - Fonction appelée lors du changement d'images
 * @param {Function} props.onRemoveImage - Fonction appelée pour supprimer une image
 * @param {boolean} props.editMode - Indique si on est en mode édition
 */
const ProductDialog = ({
  open,
  onClose,
  formData,
  onChange,
  onSubmit,
  categories,
  companies,
  availableSubcategories,
  imagePreviews,
  onImageChange,
  onRemoveImage,
  editMode
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editMode ? 'Modifier le produit' : 'Ajouter un produit'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="nom"
              label="Nom du produit"
              fullWidth
              value={formData.nom}
              onChange={onChange}
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
                onChange={onChange}
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
              onChange={onChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="product-type-label">Type de produit</InputLabel>
              <Select
                labelId="product-type-label"
                name="productType"
                value={formData.productType}
                onChange={onChange}
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
          </Grid>
          {formData.productType === 'simple' && (
            <Grid item xs={12} sm={6}>
              <TextField
                name="quantite"
                label="Quantité en stock"
                fullWidth
                type="number"
                value={formData.quantite || '0'}
                onChange={onChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          )}
          {formData.productType === 'variable' && (
            <Grid item xs={12} sm={6}>
              <Alert severity="info" sx={{ mt: 1 }}>
                Les variations de produit pourront être ajoutées après la création du produit.
              </Alert>
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
              onChange={onChange}
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
              onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
                input={<OutlinedInput label="Sous-catégories" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const subcategory = availableSubcategories.find(sub => sub._id === value);
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
              onChange={onImageChange}
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
                  onDelete={() => onRemoveImage(index)}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!formData.nom || !formData.oldPrice || !formData.Company_id || formData.categoriesa_id.length === 0}
        >
          {editMode ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDialog;