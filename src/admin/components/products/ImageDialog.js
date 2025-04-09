import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, IconButton, Grid
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import ImagePreview from '../common/ImagePreview';

/**
 * Dialogue de gestion des images d'un produit
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.open - Indique si le dialogue est ouvert
 * @param {Function} props.onClose - Fonction appelée lors de la fermeture
 * @param {Object} props.product - Produit dont on gère les images
 * @param {Array} props.selectedImages - Images sélectionnées pour upload
 * @param {Function} props.onImageChange - Fonction appelée lors du changement d'images
 * @param {Function} props.onRemoveImage - Fonction appelée pour retirer une image sélectionnée
 * @param {Function} props.onRemoveServerImage - Fonction appelée pour supprimer une image du serveur
 * @param {Function} props.onSave - Fonction appelée pour enregistrer les nouvelles images
 */
const ImageDialog = ({
  open,
  onClose,
  product,
  selectedImages,
  onImageChange,
  onRemoveImage,
  onRemoveServerImage,
  onSave
}) => {
  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>Gérer les images du produit</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Images actuelles
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {product && product.pictures && product.pictures.length > 0 ? (
                product.pictures.map((src, index) => (
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
                      onClick={() => onRemoveServerImage(product._id, index)}
                    >
                      <Delete color="error" />
                    </IconButton>
                    {src === product.mainPicture && (
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
              onChange={onImageChange}
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
          onClick={() => onSave(product._id, selectedImages)}
          variant="contained"
          disabled={selectedImages.length === 0}
        >
          Enregistrer les nouvelles images
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageDialog;