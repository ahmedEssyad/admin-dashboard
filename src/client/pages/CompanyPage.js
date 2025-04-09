import React, { useState, useEffect } from 'react';
import { 
  Typography, Grid, Box, Container, Breadcrumbs, Link, Skeleton,
  Tabs, Tab, Divider, Chip, Paper
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard';
import CategoryCard from '../components/common/CategoryCard';

const CompanyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les détails de l'entreprise
        const companyResponse = await axios.get(`/api/companies/${id}`);
        setCompany(companyResponse.data);
        
        // Récupérer les produits de cette entreprise
        const productsResponse = await axios.get('/api/products', { 
          params: { companies: id } 
        });
        setProducts(productsResponse.data);
        
        // Extraire les catégories uniques des produits
        if (companyResponse.data.categories_id) {
          setCategories(companyResponse.data.categories_id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données de l\'entreprise:', error);
        navigate('/404');
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Rendu du squelette pendant le chargement
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="50%" height={30} />
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="text" width="80%" height={30} />
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={20} />
          </Grid>
          <Grid item xs={12} md={9}>
            <Skeleton variant="rectangular" width="100%" height={50} sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mb: 1 }} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="40%" />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Si l'entreprise n'est pas trouvée
  if (!company) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h5" color="error" sx={{ mt: 4 }}>
          Entreprise non trouvée
        </Typography>
        <Link component={RouterLink} to="/" variant="contained" sx={{ mt: 2, display: 'inline-block' }}>
          Retour à l'accueil
        </Link>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} underline="hover" color="inherit" to="/">
            Accueil
          </Link>
          <Link component={RouterLink} underline="hover" color="inherit" to="/companies">
            Marques
          </Link>
          <Typography color="text.primary">{company.nom}</Typography>
        </Breadcrumbs>
      </Box>
      
      <Grid container spacing={4}>
        {/* Colonne de gauche - Informations */}
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                boxShadow: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3
              }}
            >
              <Box 
                sx={{ 
                  width: '100%', 
                  height: 200, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.nom}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain' 
                    }}
                  />
                ) : (
                  <Typography variant="h6" color="text.secondary">
                    Logo non disponible
                  </Typography>
                )}
              </Box>
              
              <Typography variant="h5" component="h1" align="center" gutterBottom>
                {company.nom}
              </Typography>
              
              {categories.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Catégories:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {categories.map((category) => (
                      <Chip
                        key={typeof category === 'object' ? category._id : category}
                        label={typeof category === 'object' ? category.name : 'Catégorie'}
                        component={RouterLink}
                        to={`/categories/${typeof category === 'object' ? category._id : category}`}
                        clickable
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
            
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                boxShadow: 2
              }}
            >
              <Typography variant="h6" gutterBottom>
                Statistiques
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Produits:</Typography>
                <Typography variant="body2" fontWeight="bold">{products.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Catégories:</Typography>
                <Typography variant="body2" fontWeight="bold">{categories.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Promotions:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {products.filter(p => p.discountedPrice).length}
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        
        {/* Colonne de droite - Produits et catégories */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ borderRadius: 2, boxShadow: 2, mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Produits" />
              <Tab label="Catégories" />
              {products.some(p => p.discountedPrice) && (
                <Tab label="Promotions" />
              )}
            </Tabs>
          </Paper>
          
          {tabValue === 0 && (
            <>
              <Typography variant="h5" gutterBottom>
                Produits de {company.nom}
              </Typography>
              
              {products.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Grid container spacing={3}>
                    {products.map((product, index) => (
                      <Grid item xs={12} sm={6} md={4} key={product._id}>
                        <ProductCard product={product} index={index} />
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              ) : (
                <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Aucun produit trouvé pour cette entreprise.
                  </Typography>
                </Paper>
              )}
            </>
          )}
          
          {tabValue === 1 && (
            <>
              <Typography variant="h5" gutterBottom>
                Catégories de {company.nom}
              </Typography>
              
              {categories.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Grid container spacing={3}>
                    {categories.map((category, index) => (
                      <Grid item xs={12} sm={6} md={4} key={typeof category === 'object' ? category._id : index}>
                        {typeof category === 'object' ? (
                          <CategoryCard category={category} index={index} />
                        ) : (
                          <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                              Catégorie non disponible
                            </Typography>
                          </Paper>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              ) : (
                <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Aucune catégorie trouvée pour cette entreprise.
                  </Typography>
                </Paper>
              )}
            </>
          )}
          
          {tabValue === 2 && (
            <>
              <Typography variant="h5" gutterBottom>
                Promotions de {company.nom}
              </Typography>
              
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Grid container spacing={3}>
                  {products
                    .filter(product => product.discountedPrice)
                    .map((product, index) => (
                      <Grid item xs={12} sm={6} md={4} key={product._id}>
                        <ProductCard product={product} index={index} />
                      </Grid>
                    ))}
                </Grid>
              </motion.div>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CompanyPage;