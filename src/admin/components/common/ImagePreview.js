import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';

/**
 * Composant d'aperçu d'image avec bouton de suppression
 * @param {Object} props - Propriétés du composant
 * @param {string} props.src - URL de l'image
 * @param {string} props.alt - Texte alternatif de l'image
 * @param {Function} props.onDelete - Fonction appelée pour supprimer l'image
 */
const ImagePreview = ({ src, alt, onDelete }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 100,
        height: 100,
        m: 0.5,
        border: '1px solid #ddd',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <img
        src={src}
        alt={alt}
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
        onClick={onDelete}
      >
        <Delete color="error" />
      </IconButton>
    </Box>
  );
};

export default ImagePreview;