import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Tabs,
  Tab,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Pagination,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  Inventory as ProductIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import api from '../../api/api';
import { useAuth } from '../../shared/contexts/AuthContext';

const Search = () => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({
    products: [],
    categories: [],
    companies: []
  });
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const itemsPerPage = 12;

  // Extraire le terme de recherche de l'URL au chargement
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchTerm(q);
      performSearch(q);
    }
  }, [location.search]);

  // Fonction de recherche
  const performSearch = async (term) => {
    if (!term.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Recherche de produits
      const productsResponse = await api.get(`/products/search?q=${encodeURIComponent(term)}`);
      
      // Recherche de catégories (adaptation nécessaire selon votre API)
      const categoriesResponse = await api.get(`/categories?search=${encodeURIComponent(term)}`);
      
      // Recherche d'entreprises (adaptation nécessaire selon votre API)
      const companiesResponse = await api.get(`/companies?search=${encodeURIComponent(term)}`);
      
      setSearchResults({
        products: productsResponse.data?.data || [],
        categories: categoriesResponse.data || [],
        companies: companiesResponse.data || []
      });
      
      // Sélectionner l'onglet avec des résultats par défaut
      if (productsResponse.data?.data?.length > 0) {
        setTabValue(0);
      } else if (categoriesResponse.data?.length > 0) {
        setTabValue(1);
      } else if (companiesResponse.data?.length > 0) {
        setTabValue(2);
      }
      
      setPage(1); // Réinitialiser la pagination
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire de soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(searchTerm);
    
    // Mettre à jour l'URL pour refléter la recherche
    const url = new URL(window.location);
    url.searchParams.set('q', searchTerm);
    window.history.pushState({}, '', url);
  };

  // Changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Réinitialiser la pagination lors du changement d'onglet
  };

  // Calcul des éléments à afficher selon la pagination
  const getCurrentItems = () => {
    let items = [];
    
    if (tabValue === 0) {
      items = searchResults.products;
    } else if (tabValue === 1) {
      items = searchResults.categories;
    } else if (tabValue === 2) {
      items = searchResults.companies;
    }
    
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };
  
  // Calcul du nombre total de pages
  const getTotalPages = () => {
    let totalItems = 0;
    
    if (tabValue === 0) {
      totalItems = searchResults.products.length;
    } else if (tabValue === 1) {
      totalItems = searchResults.categories.length;
    } else if (tabValue === 2) {
      totalItems = searchResults.companies.length;
    }
    
    return Math.ceil(totalItems / itemsPerPage);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recherche
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Recherchez des produits, catégories et entreprises dans la base de données
        </Typography>
      </Box>
      
      {/* Formulaire de recherche */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher par nom, description, caractéristiques..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  )}
                  <Button 
                    variant="contained" 
                    type="submit" 
                    disabled={!searchTerm.trim() || loading}
                    sx={{ ml: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Rechercher"}
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Paper>
      
      {/* Message d'erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Résultats de recherche */}
      {searchTerm && !loading && (
        <Box>
          {/* Onglets de catégories */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab 
                label={`Produits (${searchResults.products.length})`} 
                icon={<ProductIcon />} 
                iconPosition="start"
              />
              <Tab 
                label={`Catégories (${searchResults.categories.length})`} 
                icon={<CategoryIcon />} 
                iconPosition="start"
              />
              <Tab 
                label={`Entreprises (${searchResults.companies.length})`} 
                icon={<BusinessIcon />} 
                iconPosition="start"
              />
            </Tabs>
            
            {tabValue === 0 && (
              <Box>
                <Tooltip title="Vue liste">
                  <IconButton 
                    color={viewMode === 'list' ? 'primary' : 'default'} 
                    onClick={() => setViewMode('list')}
                  >
                    <ViewListIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Vue grille">
                  <IconButton 
                    color={viewMode === 'grid' ? 'primary' : 'default'} 
                    onClick={() => setViewMode('grid')}
                  >
                    <ViewModuleIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Contenu de l'onglet Produits */}
          {tabValue === 0 && (
            <>
              {searchResults.products.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    Aucun produit trouvé pour "{searchTerm}"
                  </Typography>
                </Box>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    // Vue grille
                    <Grid container spacing={3}>
                      {getCurrentItems().map((product) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                          <Card sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            }
                          }}>
                            <CardMedia
                              component="img"
                              height="180"
                              image={product.mainPicture || 'https://via.placeholder.com/300x200?text=Pas+d%27image'}
                              alt={product.nom}
                              sx={{ objectFit: 'contain', bgcolor: '#f5f5f5' }}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" component="div" gutterBottom>
                                {product.nom}
                              </Typography>
                              
                              <Box sx={{ mb: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {product.Company_id && (
                                  <Chip 
                                    size="small" 
                                    label={product.Company_id.nom || "Entreprise"} 
                                    color="primary"
                                    variant="outlined"
                                  />
                                )}
                                
                                {product.categoriesa_id && product.categoriesa_id[0] && (
                                  <Chip 
                                    size="small" 
                                    label={
                                      typeof product.categoriesa_id[0] === 'object'
                                        ? product.categoriesa_id[0].name
                                        : "Catégorie"
                                    } 
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {product.description && product.description.length > 80
                                  ? `${product.description.substring(0, 80)}...`
                                  : product.description || 'Aucune description disponible.'}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {product.discountedPrice ? (
                                  <>
                                    <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                                      {parseFloat(product.discountedPrice).toFixed(2)} €
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1, textDecoration: 'line-through' }}>
                                      {parseFloat(product.oldPrice).toFixed(2)} €
                                    </Typography>
                                  </>
                                ) : (
                                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {parseFloat(product.oldPrice).toFixed(2)} €
                                  </Typography>
                                )}
                              </Box>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                              <Tooltip title="Voir les détails">
                                <IconButton 
                                  color="primary"
                                  component="a"
                                  href={`/admin/products/${product._id}`}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              
                              {hasPermission('products', 'update') && (
                                <Tooltip title="Modifier">
                                  <IconButton 
                                    color="secondary"
                                    component="a"
                                    href={`/admin/products/edit/${product._id}`}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    // Vue liste
                    <List>
                      {getCurrentItems().map((product) => (
                        <React.Fragment key={product._id}>
                          <ListItem 
                            alignItems="flex-start"
                            secondaryAction={
                              <Box>
                                <Tooltip title="Voir les détails">
                                  <IconButton 
                                    edge="end" 
                                    component="a"
                                    href={`/admin/products/${product._id}`}
                                  >
                                    <ViewIcon />
                                  </IconButton>
                                </Tooltip>
                                {hasPermission('products', 'update') && (
                                  <Tooltip title="Modifier">
                                    <IconButton 
                                      edge="end" 
                                      component="a"
                                      href={`/admin/products/edit/${product._id}`}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar 
                                variant="rounded" 
                                src={product.mainPicture} 
                                alt={product.nom}
                                sx={{ width: 80, height: 80, mr: 2 }}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="h6" component="div">
                                    {product.nom}
                                  </Typography>
                                  {product.discountedPrice && (
                                    <Chip size="small" color="error" label="Promotion" />
                                  )}
                                </Box>
                              }
                              secondary={
                                <React.Fragment>
                                  <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{ display: 'block', mb: 0.5 }}
                                  >
                                    {product.Company_id?.nom && `Entreprise: ${product.Company_id.nom}`}
                                    {product.categoriesa_id?.[0]?.name && ` | Catégorie: ${product.categoriesa_id[0].name}`}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ display: 'block', mb: 0.5 }}
                                  >
                                    {product.description?.substring(0, 150)}
                                    {product.description?.length > 150 ? '...' : ''}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {product.discountedPrice ? (
                                      <>
                                        <Typography variant="body1" color="error" sx={{ fontWeight: 'bold' }}>
                                          {parseFloat(product.discountedPrice).toFixed(2)} €
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1, textDecoration: 'line-through' }}>
                                          {parseFloat(product.oldPrice).toFixed(2)} €
                                        </Typography>
                                      </>
                                    ) : (
                                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {parseFloat(product.oldPrice).toFixed(2)} €
                                      </Typography>
                                    )}
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                      | Stock: {product.quantite} unités
                                    </Typography>
                                  </Box>
                                </React.Fragment>
                              }
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </>
              )}
            </>
          )}
          
          {/* Contenu de l'onglet Catégories */}
          {tabValue === 1 && (
            <>
              {searchResults.categories.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    Aucune catégorie trouvée pour "{searchTerm}"
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {getCurrentItems().map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category._id}>
                      <Card sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                        } 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CategoryIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                            <Typography variant="h6" component="div">
                              {category.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {category.description || 'Aucune description disponible.'}
                          </Typography>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">
                                Sous-catégories:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                {category.subcategories.map((subcat) => (
                                  <Chip 
                                    key={subcat._id} 
                                    label={subcat.name} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button 
                            startIcon={<ViewIcon />}
                            href={`/admin/categories/${category._id}`}
                          >
                            Voir les détails
                          </Button>
                          {hasPermission('categories', 'update') && (
                            <Button 
                              startIcon={<EditIcon />}
                              href={`/admin/categories/edit/${category._id}`}
                              color="secondary"
                            >
                              Modifier
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
          
          {/* Contenu de l'onglet Entreprises */}
          {tabValue === 2 && (
            <>
              {searchResults.companies.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    Aucune entreprise trouvée pour "{searchTerm}"
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {getCurrentItems().map((company) => (
                    <Grid item xs={12} sm={6} md={4} key={company._id}>
                      <Card sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                        }
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {company.logo ? (
                              <Avatar 
                                src={company.logo} 
                                alt={company.nom} 
                                sx={{ width: 60, height: 60, mr: 2 }}
                              />
                            ) : (
                              <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                            )}
                            <Typography variant="h6" component="div">
                              {company.nom}
                            </Typography>
                          </Box>
                          
                          {company.categories_id && company.categories_id.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">
                                Catégories:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                {company.categories_id.map((cat) => (
                                  <Chip 
                                    key={typeof cat === 'object' ? cat._id : cat} 
                                    label={typeof cat === 'object' ? cat.name : 'Catégorie'} 
                                    size="small" 
                                    color="primary"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button 
                            startIcon={<ArrowForwardIcon />}
                            href={`/admin/company/${company._id}`}
                            color="primary"
                          >
                            Voir les produits
                          </Button>
                          {hasPermission('companies', 'update') && (
                            <Button 
                              startIcon={<EditIcon />}
                              href={`/admin/companies/edit/${company._id}`}
                              color="secondary"
                            >
                              Modifier
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
          
          {/* Pagination */}
          {getTotalPages() > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={getTotalPages()}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      )}
      
      {/* Message si aucune recherche n'a été effectuée */}
      {!searchTerm && !loading && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          py: 8 
        }}>
          <SearchIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" align="center" gutterBottom>
            Recherchez des produits, catégories ou entreprises
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Entrez un terme de recherche dans le champ ci-dessus pour commencer
          </Typography>
        </Box>
      )}
      
      {/* Affiche le chargement */}
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default Search;