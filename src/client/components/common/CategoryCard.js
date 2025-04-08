import React from 'react';
import { 
  Card, CardContent, Typography, Box, 
  CardActionArea, Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const CategoryCard = ({ category, index, compact = false }) => {
  // Ajouter un délai basé sur l'index pour l'animation staggered
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: index ? index * 0.1 : 0 // Ajouter un délai basé sur l'index
      }
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardActionArea 
          component={Link} 
          to={`/categories/${category._id}`}
          sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
        >
          <Box sx={{ height: compact ? 120 : 180, overflow: 'hidden', position: 'relative' }}>
            <LazyLoadImage
              src={category.logo || 'https://via.placeholder.com/400x200?text=Catégorie'}
              alt={category.name}
              effect="blur"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover'
              }}
              wrapperProps={{
                style: { width: '100%', height: '100%' }
              }}
            />
            {/* Overlay pour un meilleur contraste */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.4))',
              }}
            />
            
            {/* Afficher le nombre de sous-catégories si non compact */}
            {!compact && category.subcategories_id && category.subcategories_id.length > 0 && (
              <Chip
                label={`${category.subcategories_id.length} sous-catégorie${category.subcategories_id.length > 1 ? 's' : ''}`}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: 'text.primary',
                }}
              />
            )}
          </Box>
          
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography 
              variant={compact ? "h6" : "h5"} 
              component="div" 
              gutterBottom
              title={category.name}
              noWrap={compact}
            >
              {category.name}
            </Typography>
            
            {/* Description - uniquement si non compact */}
            {!compact && category.description && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {category.description}
              </Typography>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </motion.div>
  );
};

export default CategoryCard;