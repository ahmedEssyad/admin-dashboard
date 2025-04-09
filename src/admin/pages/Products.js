import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Button, Box, CircularProgress, Grid, Paper, Pagination
} from '@mui/material';
import { Add } from '@mui/icons-material';

// Custom hook et composants
import useProducts from '../hooks/useProducts';
import ProductCard from '../components/products/ProductCard';
import ProductDialog from '../components/products/ProductDialog';
import DiscountDialog from '../components/products/DiscountDialog';
import ImageDialog from '../components/products/ImageDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';

/**
 * Page de gestion des produits
 */
function Products() {
  const navigate = useNavigate();
  
  // Utiliser notre hook personnalisé qui contient toute la logique métier
  const {
    paginatedProducts,
    categories,
    companies,
    availableSubcategories,
    formData,
    discountData,
    selectedImages,
    imagePreviews,
    loading,
    page,
    totalPages,
    openDialog,
    openDiscountDialog,
    openImageDialog,
    confirmDialog,
    confirmDiscountRemovalDialog,
    editMode,
    selectedProduct,
    
    // Méthodes
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
    setConfirmDialog,
    setConfirmDiscountRemovalDialog,
    setSelectedImages
  } = useProducts();

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      {/* En-tête avec titre et bouton d'ajout */}
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

      {/* Grille de produits */}
      <Grid container spacing={3}>
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <ProductCard
                product={product}
                onEdit={() => navigate(`/admin/products/edit/${product._id}`)}
                onDelete={handleDeleteClick}
                onManageImages={handleOpenImageDialog}
                onManageDiscount={handleOpenDiscountDialog}
                onRemoveDiscount={handleRemoveDiscountClick}
              />
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

      {/* Pagination */}
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

      {/* Dialogues */}
      <ProductDialog
        open={openDialog}
        onClose={handleCloseDialog}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        categories={categories}
        companies={companies}
        availableSubcategories={availableSubcategories}
        imagePreviews={imagePreviews}
        onImageChange={handleImageChange}
        onRemoveImage={handleRemoveImage}
        editMode={editMode}
      />

      <DiscountDialog
        open={openDiscountDialog}
        onClose={handleCloseDiscountDialog}
        discountData={discountData}
        onChange={handleDiscountInputChange}
        onSubmit={handleSubmitDiscount}
      />

      <ImageDialog
        open={openImageDialog}
        onClose={handleCloseImageDialog}
        product={selectedProduct}
        selectedImages={selectedImages}
        onImageChange={handleImageChange}
        onRemoveImage={(index) => {
          const newImages = [...selectedImages];
          newImages.splice(index, 1);
          setSelectedImages(newImages);
        }}
        onRemoveServerImage={handleRemoveServerImage}
        onSave={(productId, images) => {
          saveProductImages(productId, images).then(result => {
            if (result.success) {
              handleCloseImageDialog();
            }
          });
        }}
      />

      {/* Dialogues de confirmation */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce produit? Cette action est irréversible."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />

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