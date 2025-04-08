import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Chip, 
  CircularProgress,
  Button,
  Divider,
  Alert,
  AlertTitle,
  Paper
} from '@mui/material';
import { ArrowBack, Business, Category } from '@mui/icons-material';
import axiosInstance from '../../../shared/api/axiosConfig';

function CompanyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get(`/companies/${id}`);
      
      if (response.data.success) {
        setCompany(response.data.data);
      } else {
        setError({
          title: 'Erreur de chargement',
          message: response.data.message || 'Impossible de charger les détails de l\'entreprise.'
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'entreprise:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Une erreur inattendue est survenue.';
      
      setError({
        title: 'Erreur de chargement',
        message: errorMessage,
        details: error.response?.data?.error
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    navigate('/admin/companies');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          variant="outlined" 
          onClick={handleBackToList}
          sx={{ mb: 2 }}
        >
          Retour à la liste des entreprises
        </Button>
        
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>{error.title}</AlertTitle>
          {error.message}
          {error.details && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Détails techniques: {error.details}
            </Typography>
          )}
        </Alert>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            onClick={fetchCompany}
            sx={{ mr: 2 }}
          >
            Réessayer
          </Button>
        </Box>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={{ py: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          variant="outlined" 
          onClick={handleBackToList}
          sx={{ mb: 2 }}
        >
          Retour à la liste des entreprises
        </Button>
        
        <Alert severity="warning">
          <AlertTitle>Entreprise introuvable</AlertTitle>
          Cette entreprise n'existe pas ou a été supprimée.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Button 
        startIcon={<ArrowBack />} 
        variant="outlined" 
        onClick={handleBackToList}
        sx={{ mb: 3 }}
      >
        Retour à la liste des entreprises
      </Button>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {company.logo ? (
              <Card>
                <CardMedia
                  component="img"
                  image={company.logo}
                  alt={company.nom}
                  sx={{ height: 240, objectFit: 'contain', bgcolor: 'white' }}
                />
              </Card>
            ) : (
              <Card sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                <Business sx={{ fontSize: 80, color: 'grey.500' }} />
              </Card>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {company.nom}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Category sx={{ mr: 1 }} /> Catégories
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {company.categories_id && company.categories_id.length > 0 ? (
                  company.categories_id.map((category) => (
                    <Chip
                      key={category._id}
                      label={category.name}
                      color="primary"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucune catégorie associée
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom>
                Sous-catégories
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {company.subcategories_id && company.subcategories_id.length > 0 ? (
                  company.subcategories_id.map((subcategory) => (
                    <Chip
                      key={subcategory._id}
                      label={subcategory.name}
                      color="secondary"
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucune sous-catégorie associée
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate(`/admin/companies/edit/${company._id}`)}
        >
          Modifier
        </Button>
      </Box>
    </Box>
  );
}

export default CompanyPage;