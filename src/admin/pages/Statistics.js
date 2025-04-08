import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Grid, Paper, CircularProgress, Button, FormControl,
  InputLabel, MenuItem, Select, Card, CardContent, Tab, Tabs
} from '@mui/material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  FileDownload as FileDownloadIcon, 
  ShowChart as ChartIcon, 
  PieChart as PieChartIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import axiosInstance from '../../shared/api/axiosConfig';
import { toast } from 'react-toastify';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A52A2A', '#7B68EE', '#FF6347', '#20B2AA'];

function Statistics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('3months');
  const [selectedTab, setSelectedTab] = useState(0);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [productsByCompany, setProductsByCompany] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Récupérer les statistiques générales
      const statsResponse = await axiosInstance.get('/stats');
      setStats(statsResponse.data);

      // Récupérer toutes les catégories
      const categoriesResponse = await axiosInstance.get('/categories');
      setCategories(categoriesResponse.data);

      // Récupérer toutes les entreprises
      const companiesResponse = await axiosInstance.get('/companies');
      setCompanies(companiesResponse.data);

      // Récupérer tous les produits
      const productsResponse = await axiosInstance.get('/products');
      setProducts(productsResponse.data);

      // Calculer les statistiques
      calculateProductsByCategory(productsResponse.data, categoriesResponse.data);
      calculateProductsByCompany(productsResponse.data, companiesResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Impossible de charger les données statistiques');
      setLoading(false);
    }
  };

  const calculateProductsByCategory = (products, categories) => {
    const result = categories.map(category => {
      const count = products.filter(product => 
        product.categoriesa_id.some(cat => 
          (typeof cat === 'object' ? cat._id : cat) === category._id
        )
      ).length;
      
      return {
        name: category.name,
        count: count
      };
    }).sort((a, b) => b.count - a.count);

    setProductsByCategory(result);
  };

  const calculateProductsByCompany = (products, companies) => {
    const result = companies.map(company => {
      const count = products.filter(product => 
        (typeof product.Company_id === 'object' ? product.Company_id._id : product.Company_id) === company._id
      ).length;
      
      return {
        name: company.nom,
        count: count
      };
    }).sort((a, b) => b.count - a.count);

    setProductsByCompany(result);
  };

  const getMonthlyData = () => {
    const now = new Date();
    let monthsData = [];
    
    let monthsToShow;
    switch (selectedPeriod) {
      case '3months':
        monthsToShow = 3;
        break;
      case '6months':
        monthsToShow = 6;
        break;
      case '12months':
        monthsToShow = 12;
        break;
      default:
        monthsToShow = 3;
    }

    for (let i = 0; i < monthsToShow; i++) {
      const month = subMonths(now, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthName = format(month, 'MMMM yyyy', { locale: fr });

      // Simuler des données pour cet exemple
      // Dans une application réelle, vous utiliseriez des données de votre base de données
      const monthStats = {
        name: monthName,
        nouveauxProduits: Math.floor(Math.random() * 20),
        produitsEnPromotion: Math.floor(Math.random() * 15),
        visites: Math.floor(Math.random() * 1000) + 100
      };

      monthsData.push(monthStats);
    }

    return monthsData.reverse();
  };

  const handlePeriodChange = (event) => {
    setSelectedPeriod(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const exportToExcel = () => {
    // Créer les données pour l'exportation
    const workbook = XLSX.utils.book_new();
    
    // Feuille de produits
    const productsData = products.map(product => ({
      'ID': product._id,
      'Nom': product.nom,
      'Description': product.description || '',
      'Prix': product.oldPrice,
      'Prix remisé': product.discountedPrice || '',
      'Quantité': product.quantite || 0,
      'Entreprise': product.Company_id.nom || '',
      'Catégories': product.categoriesa_id.map(cat => cat.name).join(', '),
      'Sous-catégories': product.subcategories_id.map(sub => sub.name).join(', '),
      'Date de création': new Date(product.createdAt).toLocaleDateString('fr-FR')
    }));
    
    const productsWorksheet = XLSX.utils.json_to_sheet(productsData);
    XLSX.utils.book_append_sheet(workbook, productsWorksheet, 'Produits');
    
    // Feuille de catégories
    const categoriesData = categories.map(category => ({
      'ID': category._id,
      'Nom': category.name,
      'Description': category.description || '',
      'Nombre de produits': productsByCategory.find(c => c.name === category.name)?.count || 0
    }));
    
    const categoriesWorksheet = XLSX.utils.json_to_sheet(categoriesData);
    XLSX.utils.book_append_sheet(workbook, categoriesWorksheet, 'Catégories');
    
    // Feuille d'entreprises
    const companiesData = companies.map(company => ({
      'ID': company._id,
      'Nom': company.nom,
      'Nombre de produits': productsByCompany.find(c => c.name === company.nom)?.count || 0,
      'Catégories': company.categories_id.map(cat => cat.name).join(', ')
    }));
    
    const companiesWorksheet = XLSX.utils.json_to_sheet(companiesData);
    XLSX.utils.book_append_sheet(workbook, companiesWorksheet, 'Entreprises');
    
    // Exporter le fichier
    XLSX.writeFile(workbook, `Catalogue_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Données exportées avec succès');
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
        <Typography variant="h4">Statistiques et Analyses</Typography>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={exportToExcel}
        >
          Exporter en Excel
        </Button>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        sx={{ mb: 3 }}
      >
        <Tab icon={<AssessmentIcon />} label="Vue d'ensemble" />
        <Tab icon={<ChartIcon />} label="Tendances" />
        <Tab icon={<PieChartIcon />} label="Répartition" />
      </Tabs>

      {selectedTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Résumé du catalogue</Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    <strong>Nombre de catégories:</strong> {stats?.categories || 0}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Nombre d'entreprises:</strong> {stats?.companies || 0}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Nombre de produits:</strong> {stats?.products || 0}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Produits en promotion:</strong> {
                      products.filter(p => p.discountedPrice && new Date(p.discountDuration) > new Date()).length
                    }
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Top 5 catégories par nombre de produits</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={productsByCategory.slice(0, 5)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Nombre de produits" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Top 5 entreprises par nombre de produits</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={productsByCompany.slice(0, 5)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Nombre de produits" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Répartition des produits par gamme de prix</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: '< 10€', value: products.filter(p => p.oldPrice < 10).length },
                      { name: '10-50€', value: products.filter(p => p.oldPrice >= 10 && p.oldPrice < 50).length },
                      { name: '50-100€', value: products.filter(p => p.oldPrice >= 50 && p.oldPrice < 100).length },
                      { name: '100-500€', value: products.filter(p => p.oldPrice >= 100 && p.oldPrice < 500).length },
                      { name: '> 500€', value: products.filter(p => p.oldPrice >= 500).length },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: '< 10€', value: products.filter(p => p.oldPrice < 10).length },
                      { name: '10-50€', value: products.filter(p => p.oldPrice >= 10 && p.oldPrice < 50).length },
                      { name: '50-100€', value: products.filter(p => p.oldPrice >= 50 && p.oldPrice < 100).length },
                      { name: '100-500€', value: products.filter(p => p.oldPrice >= 100 && p.oldPrice < 500).length },
                      { name: '> 500€', value: products.filter(p => p.oldPrice >= 500).length },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {selectedTab === 1 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="period-label">Période</InputLabel>
              <Select
                labelId="period-label"
                value={selectedPeriod}
                onChange={handlePeriodChange}
                label="Période"
              >
                <MenuItem value="3months">3 derniers mois</MenuItem>
                <MenuItem value="6months">6 derniers mois</MenuItem>
                <MenuItem value="12months">12 derniers mois</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Évolution mensuelle</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={getMonthlyData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="nouveauxProduits"
                      name="Nouveaux produits"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="produitsEnPromotion"
                      name="Produits en promotion"
                      stroke="#82ca9d"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="visites"
                      name="Visites (simulation)"
                      stroke="#ff7300"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {selectedTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Répartition des produits par catégorie</Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={productsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) => 
                      percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {productsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Répartition des produits par entreprise</Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={productsByCompany}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) => 
                      percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {productsByCompany.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Répartition des produits par niveau de stock</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Épuisé (0)', value: products.filter(p => p.quantite === 0).length },
                    { name: 'Faible (1-10)', value: products.filter(p => p.quantite > 0 && p.quantite <= 10).length },
                    { name: 'Moyen (11-50)', value: products.filter(p => p.quantite > 10 && p.quantite <= 50).length },
                    { name: 'Élevé (>50)', value: products.filter(p => p.quantite > 50).length },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Nombre de produits" fill="#8884d8">
                    {[
                      { name: 'Épuisé (0)', value: products.filter(p => p.quantite === 0).length },
                      { name: 'Faible (1-10)', value: products.filter(p => p.quantite > 0 && p.quantite <= 10).length },
                      { name: 'Moyen (11-50)', value: products.filter(p => p.quantite > 10 && p.quantite <= 50).length },
                      { name: 'Élevé (>50)', value: products.filter(p => p.quantite > 50).length },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </div>
  );
}

export default Statistics;