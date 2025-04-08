import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Grid, Card, CardMedia, CardContent, CardActions,
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  CircularProgress, IconButton, InputAdornment, Chip, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Pagination, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Edit, Delete, Search as SearchIcon, Add as AddIcon,
  LocalOffer, MonetizationOn
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import axiosInstance from '../../shared/api/axiosConfig';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Promotions = () => {
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    discountedPrice: '',
    discountDuration: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') // 7 jours par défaut
  });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'table'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les produits
      const productsResponse = await axiosInstance.get('/products');
      setProducts(productsResponse.data);
      
      // Filtrer les produits en promotion
      const promos = productsResponse.data.filter(
        product => product.discountedPrice && new Date(product.discountDuration) > new Date()
      );
      setPromotions(promos);
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setFormData({
        productId: product._id,
        discountedPrice: product.discountedPrice?.toString() || '',
        discountDuration: product.discountDuration 
          ? format(new Date(product.discountDuration), 'yyyy-MM-dd')
          : format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      });
    } else {
      setFormData({
        productId: '',
        discountedPrice: '',
        discountDuration: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await axiosInstance.put(`/products/${formData.productId}/discount`, {
        discountedPrice: formData.discountedPrice,
        discountDuration: formData.discountDuration
      });
      
      toast.success('Promotion appliquée avec succès');
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Erreur lors de l\'application de la promotion:', error);
      toast.error('Erreur lors de l\'application de la promotion');
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/products/${confirmDialog.id}/discount`);
      toast.success('Promotion supprimée avec succès');
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression de la promotion:', error);
      toast.error('Erreur lors de la suppression de la promotion');
    } finally {
      setConfirmDialog({ open: false, id: null });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const filteredPromotions = promotions.filter(
    promo => promo.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (promo.Company_id.nom && promo.Company_id.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const paginatedPromotions = filteredPromotions.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Calcul du pourcentage de réduction
  const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
    return Math.round((1 - discountedPrice / originalPrice) * 100);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">Gestion des Promotions</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter une promotion
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            {viewMode === 'grid' ? 'Vue tableau' : 'Vue grille'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <LocalOffer color="error" sx={{ mr: 1 }} />
        <Typography variant="h6">
          {filteredPromotions.length} produits en promotion
        </Typography>
      </Box>

      {viewMode === 'grid' ? (
        <>
          <Grid container spacing={3}>
            {paginatedPromotions.length > 0 ? (
              paginatedPromotions.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={product.mainPicture || '/placeholder-image.jpg'}
                        alt={product.nom}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          backgroundColor: 'error.main',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: 1,
                          fontWeight: 'bold',
                        }}
                      >
                        -{calculateDiscountPercentage(product.oldPrice, product.discountedPrice)}%
                      </Box>
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" noWrap>
                        {product.nom}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {product.Company_id?.nom || 'N/A'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through', mr: 1 }}
                        >
                          {product.oldPrice} €
                        </Typography>
                        <Typography variant="body1" color="error.main" fontWeight="bold">
                          {product.discountedPrice} €
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={`Jusqu'au ${format(new Date(product.discountDuration), 'dd/MM/yyyy')}`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2 }}>
                      <Tooltip title="Modifier la promotion">
                        <IconButton onClick={() => handleOpenDialog(product)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer la promotion">
                        <IconButton color="error" onClick={() => handleDeleteClick(product._id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>Aucune promotion trouvée</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Produit</TableCell>
                <TableCell>Marque</TableCell>
                <TableCell>Prix normal</TableCell>
                <TableCell>Prix promo</TableCell>
                <TableCell>Réduction</TableCell>
                <TableCell>Jusqu'au</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPromotions.length > 0 ? (
                paginatedPromotions.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Box sx={{ width: 60, height: 60 }}>
                        <img
                          src={product.mainPicture || '/placeholder-image.jpg'}
                          alt={product.nom}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{product.nom}</TableCell>
                    <TableCell>{product.Company_id?.nom || 'N/A'}</TableCell>
                    <TableCell>{product.oldPrice} €</TableCell>
                    <TableCell>{product.discountedPrice} €</TableCell>
                    <TableCell>
                      <Chip
                        label={`-${calculateDiscountPercentage(product.oldPrice, product.discountedPrice)}%`}
                        color="error"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{format(new Date(product.discountDuration), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(product)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(product._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Aucune promotion trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={Math.ceil(filteredPromotions.length / rowsPerPage)}
          page={page}
          onChange={handleChangePage}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>

      {/* Dialogue d'ajout/modification de promotion */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {formData.productId ? 'Modifier la promotion' : 'Ajouter une promotion'}
        </DialogTitle>
        <DialogContent>
          {!formData.productId && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="product-select-label">Produit</InputLabel>
              <Select
                labelId="product-select-label"
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                label="Produit"
                required
              >
                {products
                  .filter(p => !p.discountedPrice)
                  .map(product => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.nom} - {product.oldPrice} € ({product.Company_id?.nom || 'N/A'})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}

          {formData.productId && products.find(p => p._id === formData.productId) && (
            <Box sx={{ mb: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: 60, height: 60, mr: 2 }}>
                  <img
                    src={products.find(p => p._id === formData.productId)?.mainPicture || '/placeholder-image.jpg'}
                    alt="Product"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle1">
                    {products.find(p => p._id === formData.productId)?.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Prix normal: {products.find(p => p._id === formData.productId)?.oldPrice} €
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <TextField
            name="discountedPrice"
            label="Prix réduit (€)"
            fullWidth
            type="number"
            margin="normal"
            value={formData.discountedPrice}
            onChange={handleInputChange}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            }}
          />

          <TextField
            name="discountDuration"
            label="Valable jusqu'au"
            type="date"
            fullWidth
            margin="normal"
            value={formData.discountDuration}
            onChange={handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
          />

          {formData.productId && formData.discountedPrice && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Aperçu de la promotion
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MonetizationOn color="error" sx={{ mr: 1 }} />
                <Typography>
                  Réduction de {calculateDiscountPercentage(
                    products.find(p => p._id === formData.productId)?.oldPrice || 0,
                    parseFloat(formData.discountedPrice)
                  )}%
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.productId || !formData.discountedPrice}
          >
            {formData.productId ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette promotion? Le produit sera remis au prix normal."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />
    </div>
  );
};

export default Promotions;