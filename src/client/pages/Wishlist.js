import React from 'react';
import {
  Container, Typography, Box, Grid, Card, CardMedia,
  CardContent, CardActions, Button, IconButton
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { useWishlist } from '../../shared/contexts/WishlistContext';
import { useCart } from '../../shared/contexts/CartContext';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product._id);
  };

  if (wishlistItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
        <Box
          sx={{
            textAlign: 'center',
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          <Typography variant="h5" gutterBottom>
            Votre liste de souhaits est vide
          </Typography>
          <Button
            component={RouterLink}
            to="/products"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Découvrir nos produits
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ma Liste de Souhaits
      </Typography>

      <Grid container spacing={3}>
        {wishlistItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image}
                  alt={item.name}
                  sx={{ objectFit: 'cover' }}
                />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    {item.price} €
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<CartIcon />}
                    onClick={() => handleAddToCart(item)}
                    fullWidth
                    sx={{ mr: 1 }}
                  >
                    Ajouter au panier
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => removeFromWishlist(item._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Wishlist; 